/**
 * Where a magic link's token should be redeemed.
 *
 * A token is single-use, and two things want it: the web /login page and, when the
 * link was requested from the iOS app, the app itself (via colorarchive://login).
 * Until 2026-09-17 every mobile link was raced: /login tried the app scheme, waited
 * 1.5 s, then redeemed the token on the web. iOS asks "Open in ColorArchive?" first
 * and nobody answers in 1.5 s, so the browser always won and the app got
 * "Invalid or expired login link". Measured on 2026-09-16: an iOS user asked for two
 * links from the app, both logins landed in the browser, and three minutes later the
 * purchase they made in the still-logged-out app was refused with 401.
 *
 * So the link now says where it was requested, and /login only redeems on the web a
 * link that was requested on the web.
 */

// The app's URLSession identifies itself as "ColorArchive/<build> CFNetwork/<v>
// Darwin/<v>" (the build number is CFBundleVersion, which may contain dots) and sends
// no Origin. A browser's cross-origin POST from the site always
// carries Origin, which is what keeps a web request from ever being tagged as the app.
const IOS_APP_UA = /^ColorArchive\/[\d.]+ CFNetwork\//;

function isIosAppRequest(headers = {}) {
  return !headers.origin && IOS_APP_UA.test(String(headers["user-agent"] || ""));
}

function buildLoginUrl({ loginOrigin, token, nextPath, fromIosApp }) {
  const url = `${loginOrigin}/login?token=${encodeURIComponent(token)}&next=${encodeURIComponent(nextPath)}`;
  return fromIosApp ? `${url}&app=ios` : url;
}

module.exports = { isIosAppRequest, buildLoginUrl };
