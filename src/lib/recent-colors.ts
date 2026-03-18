const RECENT_COLORS_KEY = "colorarchive:recent-colors";
const RECENT_COLORS_EVENT = "colorarchive:recent-colors-updated";
const RECENT_COLORS_LIMIT = 24;

function hasWindow() {
  return typeof window !== "undefined";
}

function emitRecentColorsUpdate() {
  if (!hasWindow()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(RECENT_COLORS_EVENT));
}

export function getRecentColorIds(): string[] {
  if (!hasWindow()) {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(RECENT_COLORS_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

export function addRecentColor(colorId: string) {
  if (!hasWindow()) {
    return;
  }

  const recentIds = getRecentColorIds();
  const nextIds = [colorId, ...recentIds.filter((id) => id !== colorId)].slice(0, RECENT_COLORS_LIMIT);
  window.localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(nextIds));
  emitRecentColorsUpdate();
}

export function clearRecentColors() {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(RECENT_COLORS_KEY);
  emitRecentColorsUpdate();
}

export function subscribeToRecentColors(listener: (colorIds: string[]) => void) {
  if (!hasWindow()) {
    return () => undefined;
  }

  const handleUpdate = () => listener(getRecentColorIds());
  window.addEventListener(RECENT_COLORS_EVENT, handleUpdate);
  window.addEventListener("storage", handleUpdate);

  return () => {
    window.removeEventListener(RECENT_COLORS_EVENT, handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
}
