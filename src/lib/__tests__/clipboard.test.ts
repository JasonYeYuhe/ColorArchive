import { afterEach, describe, expect, it, vi } from "vitest";

import { writeClipboard } from "@/src/lib/clipboard";

/**
 * The point of `writeClipboard` is not that it copies — it is that it says WHY it
 * did not. Before it existed, both copy components swallowed every failure in an
 * empty catch, so "17 copies in 21 days" could not distinguish "nobody wanted to
 * take a value away" from "lots of people tried and the browser refused".
 *
 * So the assertions that matter here are the failure branches, and specifically
 * that each one keeps its own distinct `reason`. A test that only checked
 * ok/not-ok would pass while the metric stayed exactly as unusable as before.
 */

const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

function stubEnv({ writeText, isSecureContext }: {
  writeText?: unknown;
  isSecureContext?: boolean;
}) {
  Object.defineProperty(globalThis, "navigator", {
    value: writeText === undefined ? {} : { clipboard: { writeText } },
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "window", {
    value: { isSecureContext: isSecureContext ?? true },
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  if (originalNavigator) Object.defineProperty(globalThis, "navigator", originalNavigator);
  else delete (globalThis as Record<string, unknown>).navigator;
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else delete (globalThis as Record<string, unknown>).window;
});

describe("writeClipboard", () => {
  it("reports ok when the write resolves", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubEnv({ writeText });

    await expect(writeClipboard("#FFB4C2")).resolves.toEqual({ ok: true });
    expect(writeText).toHaveBeenCalledWith("#FFB4C2");
  });

  it("reports no-api when the clipboard API is absent — the embedded-webview case", async () => {
    // Instagram / X / LINE in-app browsers, i.e. exactly the traffic
    // /word-to-color/ receives. `navigator.clipboard` is undefined, so the old
    // code threw a synchronous TypeError inside the try and lost the event.
    stubEnv({ writeText: undefined });

    await expect(writeClipboard("#FFB4C2")).resolves.toEqual({ ok: false, reason: "no-api" });
  });

  it("distinguishes an insecure context from a merely missing API", async () => {
    stubEnv({ writeText: undefined, isSecureContext: false });

    await expect(writeClipboard("#FFB4C2")).resolves.toEqual({
      ok: false,
      reason: "insecure-context",
    });
  });

  it.each(["NotAllowedError", "SecurityError"])(
    "reports denied when the browser refuses with %s",
    async (name) => {
      const err = new Error("refused");
      err.name = name;
      stubEnv({ writeText: vi.fn().mockRejectedValue(err) });

      await expect(writeClipboard("#FFB4C2")).resolves.toEqual({ ok: false, reason: "denied" });
    },
  );

  it("falls back to error for a rejection with no useful name", async () => {
    stubEnv({ writeText: vi.fn().mockRejectedValue(new Error("boom")) });

    await expect(writeClipboard("#FFB4C2")).resolves.toEqual({ ok: false, reason: "error" });
  });

  it("never throws, whatever the platform does", async () => {
    // A click handler that rejects becomes an unhandled rejection, and the whole
    // point is that the failure path stays quiet for the USER while staying loud
    // in analytics.
    stubEnv({
      writeText: () => {
        throw new Error("synchronous throw");
      },
    });

    await expect(writeClipboard("#FFB4C2")).resolves.toEqual({ ok: false, reason: "error" });
  });

  it("keeps `reason` to a bounded set — it is an analytics dimension", async () => {
    // `format` was already polluted by passing runtime hex values as the label,
    // which made the dimension ungroupable. Do not repeat it with err.message.
    const err = new Error("Write permission denied for https://example.com/user/12345");
    err.name = "NotAllowedError";
    stubEnv({ writeText: vi.fn().mockRejectedValue(err) });

    const result = await writeClipboard("#FFB4C2");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(["no-api", "insecure-context", "denied", "error"]).toContain(result.reason);
      expect(JSON.stringify(result)).not.toContain("example.com");
    }
  });
});
