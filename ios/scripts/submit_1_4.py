#!/usr/bin/env python3
"""Create the ColorArchive 1.4 App Store version, set What's New and the review notes, attach
build 7, and submit for review.

Modelled on Nihongo Ride's `scripts/asc_release.py` / `submit_<version>.py` pair
(~/Documents/typing_app), which is the house pattern for this: config in the release script,
the same API call order every time, and a read-back at the end that proves what Apple actually
holds rather than what we believe we sent.

WHAT 1.4 IS
-----------
Two things, one of which the user can feel and one of which they cannot:

  * **The browse grid stops rendering a share card for every visible cell.** `contextMenu`'s
    ViewBuilder is NOT @escaping, so SwiftUI ran it during each cell's body evaluation rather
    than on long-press. Measured in a simulator: 15 renders of a 1200x800 (~3.84 MB) image on
    cold launch with zero interaction, +15 per screenful of scrolling — about 57.6 MB of image
    data produced for the first screen alone, synchronously on the main thread. Now 0, and 1 on
    the long-press that actually needs it.

  * 🔴 **Analytics start working for the first time.** `INFOPLIST_KEY_PostHogAPIKey` was set in
    project.pbxproj, but Xcode only injects INFOPLIST_KEY_* for keys it RECOGNISES — the custom
    key was dropped silently and never reached the built Info.plist, so AnalyticsBootstrap
    returned early on every launch and all 16 capture calls were no-ops. Sentry was dead the
    same way. Both are fixed, and the core browse/search/copy loop is instrumented for the
    first time.

WHY THE REVIEW NOTES SAY SO
---------------------------
Because this build begins collecting product-interaction data that no previous build actually
collected, and it adds `NSPrivacyCollectedDataTypeProductInteraction` to the app's own privacy
manifest. The ASC App Privacy declaration has said "Product Interaction -> Analytics, linked to
identity" since 2026-06-07 and is unchanged, so nothing is newly declared to users — but review
should hear it from us rather than infer it from a manifest diff.

WHAT IS DELIBERATELY NOT IN IT
------------------------------
**No description, keyword, subtitle, screenshot or IAP change.** 1.4 sells nothing new and moves
no acquisition surface; the website is the distribution change this cycle, not the listing.

Three phases:
  python3 ios/scripts/submit_1_4.py --dry-run    # print the derived copy, touch nothing
  python3 ios/scripts/submit_1_4.py --metadata   # version + What's New + review detail
  python3 ios/scripts/submit_1_4.py --submit     # attach build 7 + submit for review
"""
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
APP = "6761363087"
PLATFORM = "IOS"
VERSION = "1.4"
BUILD_NUM = "7"
RELEASE_TYPE = "AFTER_APPROVAL"   # what 1.3 used; goes live on approval without a second step

CONTACT = {"contactFirstName": "Yuhe", "contactLastName": "Ye",
           "contactPhone": "+81 08035267088", "contactEmail": "support@colorarchive.org"}

MAX_WHATS_NEW = 4000
MAX_REVIEW_NOTES = 4000
FORBIDDEN_GLYPHS = ("★",)    # BLACK STAR — ASC has rejected it on the sibling app

SUBMITTABLE = {"PREPARE_FOR_SUBMISSION", "DEVELOPER_REJECTED", "REJECTED",
               "METADATA_REJECTED", "INVALID_BINARY"}
ALREADY_SUBMITTED = {"READY_FOR_SALE", "IN_REVIEW", "WAITING_FOR_REVIEW",
                     "PENDING_DEVELOPER_RELEASE", "PROCESSING_FOR_APP_STORE"}

WHATS_NEW = {
    "en-US": (
        "Faster, lighter browsing. The colour grid was quietly building a full-size share image "
        "for every swatch on screen — around 15 of them before you had even scrolled. It now "
        "builds one only when you actually long-press a colour to share it, so the grid opens "
        "sooner, scrolls more smoothly, and uses far less memory.\n\n"
        "Also fixed: diagnostics and usage reporting were never actually starting, so crash "
        "reports were not reaching us. They work now, which means real bugs get found and fixed "
        "instead of going unnoticed."
    ),
}

REVIEW_NOTES = (
    "ColorArchive is a free colour reference and tools app. It requires no account to browse, "
    "search, or copy colour values. Version 1.4 changes no purchase, no price, no placement, "
    "and no listing metadata.\n\n"
    "TWO CHANGES, AND THE SECOND ONE IS WHY THESE NOTES EXIST.\n\n"
    "1) PERFORMANCE. The colour browse grid was rendering a full-size shareable image for every "
    "visible cell on first paint, because SwiftUI evaluates a contextMenu's ViewBuilder during "
    "the parent view's body evaluation rather than on long-press. That work now happens only "
    "when the user opens the context menu. No user-visible behaviour changed; the Share action "
    "is identical.\n\n"
    "2) ANALYTICS AND CRASH REPORTING NOW ACTUALLY RUN, AND WE ARE FLAGGING THAT RATHER THAN "
    "LETTING IT BE INFERRED FROM A MANIFEST DIFF. In every previous build the PostHog and Sentry "
    "configuration keys were declared as INFOPLIST_KEY_* build settings, which Xcode only "
    "injects for keys it recognises. Our custom keys were dropped silently, so neither SDK was "
    "ever initialised and no analytics or crash data was collected at all. Version 1.4 declares "
    "those keys in the app's Info.plist so they reach the bundle.\n\n"
    "Consequently this build adds NSPrivacyCollectedDataTypeProductInteraction to the app's own "
    "PrivacyInfo.xcprivacy, marked linked-to-identity and not used for tracking. This matches the "
    "App Privacy declaration on this app, which has stated Product Interaction -> Analytics, "
    "linked to identity, since 7 June 2026 and is unchanged in this submission. The PostHog SDK "
    "already ships its own privacy manifest declaring Product Interaction; ours is added because "
    "the SDK's generic entry marks it NOT linked, while this app calls identify() with the "
    "user's numeric account id for signed-in users, which is linked. The app's manifest is "
    "therefore the stricter and more accurate of the two.\n\n"
    "There is no advertising SDK, no IDFA, no ATT prompt, and no data sharing with brokers. "
    "Analytics contain no personally identifying information: signed-in users are keyed by an "
    "opaque numeric account id, never an email address, and search queries are never sent — only "
    "the query's length and its result count. Session replay and UI autocapture are both off.\n\n"
    "No keywords, subtitle, description, screenshots or in-app purchases changed in this version."
)


def asc(method, endpoint, body=None):
    cmd = [str(HERE / "asc_api.sh"), method, endpoint]
    if body is not None:
        cmd.append(json.dumps(body))
    out = subprocess.run(cmd, capture_output=True, text=True)
    if out.returncode != 0:
        return {"errors": [{"detail": out.stderr.strip() or "asc_api.sh failed"}]}
    return json.loads(out.stdout) if out.stdout.strip() else {}


def detail(r):
    return "; ".join(e.get("detail", str(e)) for e in r.get("errors", []))


FAILURES = []


def fail(msg):
    FAILURES.append(msg)
    print(f"  FAIL: {msg}")


def preflight():
    """Runs before every mode. Touches nothing outside this process."""
    ok = True
    for loc, text in WHATS_NEW.items():
        for g in FORBIDDEN_GLYPHS:
            if g in text:
                print(f"  preflight FAIL: What's New [{loc}] contains {g!r}"); ok = False
        if len(text) > MAX_WHATS_NEW:
            print(f"  preflight FAIL: What's New [{loc}] is {len(text)} > {MAX_WHATS_NEW}"); ok = False
    if len(REVIEW_NOTES) > MAX_REVIEW_NOTES:
        print(f"  preflight FAIL: review notes {len(REVIEW_NOTES)} > {MAX_REVIEW_NOTES}"); ok = False
    if not ok:
        sys.exit(1)
    print(f"  preflight OK (What's New "
          f"{ {k: len(v) for k, v in WHATS_NEW.items()} }, notes {len(REVIEW_NOTES)})")


def find_version():
    d = asc("GET", f"/v1/apps/{APP}/appStoreVersions?filter[platform]={PLATFORM}"
                   f"&filter[versionString]={VERSION}&limit=1")
    data = d.get("data") or []
    return data[0]["id"] if data else None


def ensure_version():
    vid = find_version()
    if vid:
        st = asc("GET", f"/v1/appStoreVersions/{vid}")["data"]["attributes"]["appStoreState"]
        print(f"  version {VERSION} exists: {vid} ({st})")
        if st in ALREADY_SUBMITTED:
            print(f"  state {st} — already submitted or live, nothing further to do")
            return vid, False
        if st not in SUBMITTABLE:
            fail(f"unrecognised version state {st!r} — refusing to guess")
            return vid, False
        return vid, True
    r = asc("POST", "/v1/appStoreVersions", {"data": {
        "type": "appStoreVersions",
        "attributes": {"platform": PLATFORM, "versionString": VERSION,
                       "releaseType": RELEASE_TYPE},
        "relationships": {"app": {"data": {"type": "apps", "id": APP}}}}})
    if r.get("errors"):
        fail(f"create version {VERSION}: {detail(r)}")
        return None, False
    vid = r["data"]["id"]
    print(f"  created version {VERSION}: {vid} (releaseType={RELEASE_TYPE})")
    return vid, True


def do_metadata():
    vid, _ = ensure_version()
    if not vid:
        return
    locs = asc("GET", f"/v1/appStoreVersions/{vid}/appStoreVersionLocalizations"
                      f"?fields[appStoreVersionLocalizations]=locale&limit=50").get("data", [])
    by_locale = {l["attributes"]["locale"]: l["id"] for l in locs}
    for locale, text in WHATS_NEW.items():
        lid = by_locale.get(locale)
        if not lid:
            fail(f"no localization for {locale} (have {sorted(by_locale)})")
            continue
        r = asc("PATCH", f"/v1/appStoreVersionLocalizations/{lid}", {"data": {
            "type": "appStoreVersionLocalizations", "id": lid,
            "attributes": {"whatsNew": text}}})
        if r.get("errors"):
            fail(f"whatsNew {locale}: {detail(r)}")
            continue
        back = asc("GET", f"/v1/appStoreVersionLocalizations/{lid}"
                          f"?fields[appStoreVersionLocalizations]=whatsNew")
        got = back["data"]["attributes"]["whatsNew"]
        print(f"  whatsNew {locale}: {'OK' if got == text else 'MISMATCH after write'}")
        if got != text:
            fail(f"whatsNew {locale} read-back mismatch")

    cur = asc("GET", f"/v1/appStoreVersions/{vid}/appStoreReviewDetail")
    attrs = dict(CONTACT, notes=REVIEW_NOTES, demoAccountRequired=False)
    if (cur.get("data") or {}).get("id"):
        rid = cur["data"]["id"]
        r = asc("PATCH", f"/v1/appStoreReviewDetails/{rid}",
                {"data": {"type": "appStoreReviewDetails", "id": rid, "attributes": attrs}})
    else:
        r = asc("POST", "/v1/appStoreReviewDetails", {"data": {
            "type": "appStoreReviewDetails", "attributes": attrs,
            "relationships": {"appStoreVersion": {
                "data": {"type": "appStoreVersions", "id": vid}}}}})
    if r.get("errors"):
        fail(f"review detail: {detail(r)}")
    else:
        back = asc("GET", f"/v1/appStoreVersions/{vid}/appStoreReviewDetail")
        n = (back.get("data") or {}).get("attributes", {}).get("notes") or ""
        print(f"  review detail: {'OK' if n == REVIEW_NOTES else 'MISMATCH after write'}")


def find_build():
    d = asc("GET", f"/v1/apps/{APP}/builds?limit=20"
                   f"&fields[builds]=version,processingState,uploadedDate")
    for b in d.get("data", []):
        if b["attributes"]["version"] == BUILD_NUM:
            return b["id"], b["attributes"]
    return None, None


def do_submit():
    vid, submittable = ensure_version()
    if not vid or not submittable:
        return
    bid, battrs = find_build()
    if not bid:
        fail(f"build {BUILD_NUM} not found on ASC yet")
        return
    if battrs["processingState"] != "VALID":
        fail(f"build {BUILD_NUM} is {battrs['processingState']}, not VALID — wait and retry")
        return
    print(f"  build {BUILD_NUM}: {bid} ({battrs['processingState']})")

    r = asc("PATCH", f"/v1/appStoreVersions/{vid}/relationships/build",
            {"data": {"type": "builds", "id": bid}})
    if r.get("errors"):
        fail(f"attach build: {detail(r)}")
        return
    print("  attached build")

    d = asc("GET", f"/v1/apps/{APP}/reviewSubmissions?filter[platform]={PLATFORM}"
                   f"&filter[state]=READY_FOR_REVIEW&limit=10")
    sid = (d.get("data") or [{}])[0].get("id") if d.get("data") else None
    if sid:
        print(f"  reusing open submission {sid}")
    else:
        sub = asc("POST", "/v1/reviewSubmissions", {"data": {
            "type": "reviewSubmissions", "attributes": {"platform": PLATFORM},
            "relationships": {"app": {"data": {"type": "apps", "id": APP}}}}})
        if sub.get("errors"):
            fail(f"create submission: {detail(sub)}")
            return
        sid = sub["data"]["id"]
        print(f"  created submission {sid}")

    it = asc("POST", "/v1/reviewSubmissionItems", {"data": {
        "type": "reviewSubmissionItems",
        "relationships": {
            "reviewSubmission": {"data": {"type": "reviewSubmissions", "id": sid}},
            "appStoreVersion": {"data": {"type": "appStoreVersions", "id": vid}}}}})
    if it.get("errors") and "already" not in detail(it).lower():
        fail(f"add item: {detail(it)}")
        return
    print("  item added")

    fin = asc("PATCH", f"/v1/reviewSubmissions/{sid}", {"data": {
        "type": "reviewSubmissions", "id": sid, "attributes": {"submitted": True}}})
    if fin.get("errors"):
        fail(f"submit: {detail(fin)}")
        return
    print(f"  SUBMIT: OK ({fin['data']['attributes']['state']})")


def read_back():
    """What Apple actually holds — never what we believe we sent."""
    print("\n--- read-back from App Store Connect ---")
    vid = find_version()
    if not vid:
        print("  no version found"); return
    v = asc("GET", f"/v1/appStoreVersions/{vid}")["data"]["attributes"]
    print(f"  version {v['versionString']}  state={v['appStoreState']}  release={v.get('releaseType')}")
    b = asc("GET", f"/v1/appStoreVersions/{vid}/build?fields[builds]=version,processingState")
    ba = (b.get("data") or {}).get("attributes")
    print(f"  build attached: {ba['version'] if ba else 'NONE'}")
    locs = asc("GET", f"/v1/appStoreVersions/{vid}/appStoreVersionLocalizations"
                      f"?fields[appStoreVersionLocalizations]=locale,whatsNew&limit=50").get("data", [])
    for l in locs:
        wn = l["attributes"].get("whatsNew") or ""
        print(f"  whatsNew[{l['attributes']['locale']}]: {len(wn)} chars"
              f" {'(matches)' if wn == WHATS_NEW.get(l['attributes']['locale']) else '(DIFFERS)'}")
    rd = asc("GET", f"/v1/appStoreVersions/{vid}/appStoreReviewDetail")
    n = (rd.get("data") or {}).get("attributes", {}).get("notes") or ""
    print(f"  review notes: {len(n)} chars {'(matches)' if n == REVIEW_NOTES else '(DIFFERS)'}")


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "--dry-run"
    preflight()
    if mode == "--dry-run":
        print("\n=== What's New ===");   [print(f"[{k}]\n{v}\n") for k, v in WHATS_NEW.items()]
        print("=== Review notes ===");  print(REVIEW_NOTES)
        print(f"\n=== Would create version {VERSION}, attach build {BUILD_NUM}, "
              f"releaseType={RELEASE_TYPE} ===")
        read_back()
    elif mode == "--metadata":
        do_metadata(); read_back()
    elif mode == "--submit":
        do_submit(); read_back()
    else:
        sys.exit(f"unknown mode {mode}")
    if FAILURES:
        print("\nFAILURES:"); [print("  -", f) for f in FAILURES]; sys.exit(1)
    print("\nOK")
