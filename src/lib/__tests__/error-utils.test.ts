import { describe, it, expect } from "vitest";
import { classifyError } from "@/src/lib/error-utils";

describe("classifyError", () => {
  it("classifies network errors", () => {
    const err = new TypeError("Failed to fetch");
    expect(classifyError(err)).toContain("internet connection");
  });

  it("classifies abort errors", () => {
    const err = new DOMException("The operation was aborted", "AbortError");
    expect(classifyError(err)).toContain("timed out");
  });

  it("classifies 503 errors", () => {
    const err = new Error("503 Service Unavailable");
    expect(classifyError(err)).toContain("temporarily unavailable");
  });

  it("passes through specific error messages", () => {
    const err = new Error("Invalid email format");
    expect(classifyError(err)).toBe("Invalid email format");
  });

  it("handles non-Error values", () => {
    expect(classifyError("string error")).toContain("Something went wrong");
    expect(classifyError(null)).toContain("Something went wrong");
    expect(classifyError(undefined)).toContain("Something went wrong");
  });
});
