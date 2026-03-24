/**
 * Classifies fetch errors into user-friendly messages.
 */
export function classifyError(err: unknown): string {
  if (err instanceof TypeError && err.message === "Failed to fetch") {
    return "Unable to connect. Please check your internet connection and try again.";
  }

  if (err instanceof DOMException && err.name === "AbortError") {
    return "Request timed out. Please try again.";
  }

  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("network") || msg.includes("fetch")) {
      return "Network error. Please check your connection and try again.";
    }
    if (msg.includes("503") || msg.includes("not configured")) {
      return "This feature is temporarily unavailable. Please try again later.";
    }
    // Server returned a specific error message
    return err.message;
  }

  return "Something went wrong. Please try again.";
}
