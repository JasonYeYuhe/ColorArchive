const ONBOARDING_KEY = "colorarchive-onboarding-dismissed";
const ONBOARDING_EVENT = "colorarchive:onboarding-updated";

function hasWindow() {
  return typeof window !== "undefined";
}

function emitOnboardingUpdate() {
  if (!hasWindow()) return;
  window.dispatchEvent(new CustomEvent(ONBOARDING_EVENT));
}

export function isOnboardingDismissed(): boolean {
  if (!hasWindow()) return true;
  try {
    return window.localStorage.getItem(ONBOARDING_KEY) === "1";
  } catch {
    return true;
  }
}

export function dismissOnboarding() {
  if (!hasWindow()) return;
  window.localStorage.setItem(ONBOARDING_KEY, "1");
  emitOnboardingUpdate();
}

export function subscribeToOnboarding(listener: (dismissed: boolean) => void) {
  if (!hasWindow()) return () => undefined;

  const handleUpdate = () => listener(isOnboardingDismissed());
  window.addEventListener(ONBOARDING_EVENT, handleUpdate);
  window.addEventListener("storage", handleUpdate);

  return () => {
    window.removeEventListener(ONBOARDING_EVENT, handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
}
