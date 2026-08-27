import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * These tests are about the ONE thing `track()` could never say before:
 * "that event did not leave the browser."
 *
 * `navigator.sendBeacon` refuses by RETURNING FALSE, not by throwing, so the
 * try/catch this function has always had caught none of it. A test that only
 * asserted "an event was sent" would have passed against the old code and
 * against the new code equally, while the interesting behaviour — falling
 * through on a refusal, and confessing the backlog afterwards — went unchecked.
 * So every assertion below is on a failure path or on the accounting.
 */

vi.mock("@/src/lib/api-config", () => ({ API_URL: "https://api.test" }));
vi.mock("@/src/lib/posthog", () => ({ phCapture: vi.fn() }));
vi.mock("@/src/lib/attribution", () => ({ attributionEventProps: () => ({ channel: "direct" }) }));
vi.mock("@/src/lib/session-id", () => ({ getSessionId: () => "sid-1" }));

const DROPPED_KEY = "ca_ev_dropped";

let store: Record<string, string>;
let sendBeacon: ReturnType<typeof vi.fn>;
let fetchMock: ReturnType<typeof vi.fn>;

/** The JSON body of the nth beacon send. */
async function beaconBody(n = 0) {
  const blob = sendBeacon.mock.calls[n][1] as Blob;
  return JSON.parse(await blob.text());
}

/** Body of the nth fetch fallback. */
function fetchBody(n = 0) {
  return JSON.parse(fetchMock.mock.calls[n][1].body as string);
}

/** Let the fetch promise chain settle. */
const flush = () => new Promise((r) => setTimeout(r, 0));

async function load() {
  vi.resetModules();
  return (await import("@/src/lib/track")).track;
}

beforeEach(() => {
  store = {};
  sendBeacon = vi.fn(() => true);
  fetchMock = vi.fn(() => Promise.resolve({ ok: true } as Response));

  Object.defineProperty(globalThis, "window", {
    value: { location: { pathname: "/word-to-color/" } },
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "navigator", {
    value: { sendBeacon },
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
    },
    configurable: true,
    writable: true,
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("track — beacon refusal", () => {
  it("a beacon that returns true is the end of it: no fallback request", async () => {
    const track = await load();
    track("word_generated", { counted: true });
    await flush();

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(store[DROPPED_KEY]).toBeUndefined();
  });

  it("FALLS THROUGH to keepalive fetch when the beacon returns false", async () => {
    // The whole defect in one assertion. The old code called sendBeacon, ignored
    // the `false`, and returned — the event was gone and nothing else ran.
    sendBeacon.mockReturnValue(false);
    const track = await load();
    track("word_generated");
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.test/events");
    expect(fetchMock.mock.calls[0][1].keepalive).toBe(true);
    // Recovered, so there is nothing to confess.
    expect(store[DROPPED_KEY]).toBeUndefined();
  });

  it("falls back the same way when sendBeacon does not exist at all", async () => {
    Object.defineProperty(globalThis, "navigator", { value: {}, configurable: true, writable: true });
    const track = await load();
    track("word_generated");
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("track — counting what never left", () => {
  it("counts and PERSISTS an event lost when both transports fail", async () => {
    sendBeacon.mockReturnValue(false);
    fetchMock.mockRejectedValue(new Error("offline"));
    const track = await load();

    track("color_copied");
    await flush();

    // localStorage, not a module variable: the likeliest moment to lose a beacon
    // is unload, when a module variable dies with the page.
    expect(store[DROPPED_KEY]).toBe("1");
  });

  it("counts a deliberate 429 as lost — the row is not in the table either", async () => {
    sendBeacon.mockReturnValue(false);
    fetchMock.mockResolvedValue({ ok: false, status: 429 } as Response);
    const track = await load();

    track("color_copied");
    await flush();

    expect(store[DROPPED_KEY]).toBe("1");
  });

  it("reports the backlog on the next event that gets through, then clears it", async () => {
    sendBeacon.mockReturnValue(false);
    fetchMock.mockRejectedValue(new Error("offline"));
    const track = await load();

    track("a");
    await flush();
    track("b");
    await flush();
    expect(store[DROPPED_KEY]).toBe("2");

    // Transport recovers.
    sendBeacon.mockReturnValue(true);
    track("c");
    await flush();

    const body = await beaconBody(2);
    expect(body.event).toBe("c");
    expect(body.props._dropped).toBe(2);
    // Confessed, so the debt is gone — the next event must not repeat it.
    expect(store[DROPPED_KEY]).toBeUndefined();

    track("d");
    await flush();
    expect((await beaconBody(3)).props._dropped).toBeUndefined();
  });

  it("hands the backlog BACK when the confessing send fails too", async () => {
    sendBeacon.mockReturnValue(false);
    fetchMock.mockRejectedValue(new Error("offline"));
    const track = await load();

    track("a");
    await flush();
    expect(store[DROPPED_KEY]).toBe("1");

    // This one carries the debt AND dies. Nothing may be forgotten: 1 owed + itself.
    track("b");
    await flush();
    expect(fetchBody(1).props._dropped).toBe(1);
    expect(store[DROPPED_KEY]).toBe("2");
  });

  it("survives a reload — the counter is read back from storage", async () => {
    store[DROPPED_KEY] = "7";
    const track = await load();

    track("after-reload");
    await flush();

    expect((await beaconBody(0)).props._dropped).toBe(7);
  });

  it("two overlapping sends never double-report and never go negative", async () => {
    // Each send clears the debt UP FRONT rather than on success. If it cleared on
    // success instead, both of these would snapshot 5, both would subtract 5, and
    // the counter would land on -5 while the backlog got reported twice.
    store[DROPPED_KEY] = "5";
    let resolveFirst: (v: unknown) => void = () => {};
    sendBeacon.mockReturnValue(false);
    fetchMock
      .mockImplementationOnce(() => new Promise((r) => { resolveFirst = r; }))
      .mockImplementation(() => Promise.resolve({ ok: true } as Response));
    const track = await load();

    track("a");
    track("b");
    resolveFirst({ ok: true });
    await flush();

    expect(fetchBody(0).props._dropped).toBe(5);
    expect(fetchBody(1).props._dropped).toBeUndefined();
    expect(store[DROPPED_KEY]).toBeUndefined();
  });

  it("ignores a corrupt stored counter rather than sending NaN", async () => {
    store[DROPPED_KEY] = "not-a-number";
    const track = await load();

    track("a");
    await flush();

    expect((await beaconBody(0)).props._dropped).toBeUndefined();
  });

  it("still tracks when storage is unavailable (private mode)", async () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: () => { throw new Error("denied"); },
        setItem: () => { throw new Error("denied"); },
        removeItem: () => { throw new Error("denied"); },
      },
      configurable: true,
      writable: true,
    });
    sendBeacon.mockReturnValue(false);
    fetchMock.mockRejectedValue(new Error("offline"));
    const track = await load();

    expect(() => track("a")).not.toThrow();
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
