const FAVORITES_STORAGE_KEY = "colorarchive:favorites";
const FAVORITES_UPDATED_EVENT = "colorarchive:favorites-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getFavoriteColorIds(): string[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue)
      ? parsedValue.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function saveFavoriteColorIds(colorIds: string[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(colorIds));
  window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT, { detail: colorIds }));
}

export function isFavoriteColor(colorId: string) {
  return getFavoriteColorIds().includes(colorId);
}

export function toggleFavoriteColor(colorId: string) {
  const existingIds = getFavoriteColorIds();
  const nextIds = existingIds.includes(colorId)
    ? existingIds.filter((id) => id !== colorId)
    : [colorId, ...existingIds];

  saveFavoriteColorIds(nextIds);
  return nextIds;
}

export function subscribeToFavorites(listener: (colorIds: string[]) => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handleUpdate = (event: Event) => {
    const customEvent = event as CustomEvent<string[]>;
    listener(Array.isArray(customEvent.detail) ? customEvent.detail : getFavoriteColorIds());
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === FAVORITES_STORAGE_KEY) {
      listener(getFavoriteColorIds());
    }
  };

  window.addEventListener(FAVORITES_UPDATED_EVENT, handleUpdate as EventListener);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(FAVORITES_UPDATED_EVENT, handleUpdate as EventListener);
    window.removeEventListener("storage", handleStorage);
  };
}
