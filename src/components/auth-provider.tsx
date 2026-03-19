"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  fetchPreferences,
  fetchSession,
  logout as logoutRequest,
  requestMagicLink as requestMagicLinkRequest,
  savePreferences,
  type AuthUser,
  verifyMagicLink as verifyMagicLinkRequest,
  type UserPreferences,
} from "@/src/lib/auth-client";
import {
  getFavoriteColorIds,
  replaceFavoriteColorIds,
  subscribeToFavorites,
} from "@/src/lib/favorites";
import {
  getPaletteIds,
  MAX_SIZE,
  replacePalette,
  subscribeToPalette,
} from "@/src/lib/palette-builder";

type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  lastSyncAt: number | null;
  requestMagicLink: (email: string) => Promise<void>;
  verifyMagicLink: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function uniqueStrings(values: string[], limit?: number): string[] {
  const nextValues = Array.from(
    new Set(values.filter((value): value is string => typeof value === "string")),
  );

  return typeof limit === "number" ? nextValues.slice(0, limit) : nextValues;
}

function arraysEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

function mergePreferences(remote: UserPreferences): UserPreferences {
  return {
    favorites: uniqueStrings([...getFavoriteColorIds(), ...remote.favorites]),
    palette: uniqueStrings([...getPaletteIds(), ...remote.palette], MAX_SIZE),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const syncEnabledRef = useRef(false);
  const persistTimeoutRef = useRef<number | null>(null);
  const preferencesRef = useRef<UserPreferences>({
    favorites: [],
    palette: [],
  });

  const applyRemotePreferences = useCallback(async () => {
    const remote = await fetchPreferences();
    const merged = mergePreferences(remote);

    preferencesRef.current = merged;
    replaceFavoriteColorIds(merged.favorites);
    replacePalette(merged.palette);

    if (
      !arraysEqual(remote.favorites, merged.favorites) ||
      !arraysEqual(remote.palette, merged.palette)
    ) {
      preferencesRef.current = await savePreferences(merged);
    }

    setLastSyncAt(Date.now());
  }, []);

  const schedulePersist = useCallback(() => {
    if (!syncEnabledRef.current || !user) {
      return;
    }

    if (persistTimeoutRef.current) {
      window.clearTimeout(persistTimeoutRef.current);
    }

    persistTimeoutRef.current = window.setTimeout(async () => {
      try {
        preferencesRef.current = await savePreferences(preferencesRef.current);
        setLastSyncAt(Date.now());
      } catch (error) {
        console.error("preference sync failed:", error);
      }
    }, 300);
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    async function initializeSession() {
      try {
        const session = await fetchSession();

        if (cancelled) {
          return;
        }

        if (!session.user) {
          setUser(null);
          setStatus("anonymous");
          syncEnabledRef.current = false;
          return;
        }

        setUser(session.user);
        setStatus("authenticated");
        syncEnabledRef.current = false;
        await applyRemotePreferences();

        if (!cancelled) {
          syncEnabledRef.current = true;
        }
      } catch (error) {
        console.error("session check failed:", error);
        if (!cancelled) {
          setUser(null);
          setStatus("anonymous");
          syncEnabledRef.current = false;
        }
      }
    }

    void initializeSession();

    return () => {
      cancelled = true;
      if (persistTimeoutRef.current) {
        window.clearTimeout(persistTimeoutRef.current);
      }
    };
  }, [applyRemotePreferences]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const unsubscribeFavorites = subscribeToFavorites((favorites) => {
      preferencesRef.current = {
        ...preferencesRef.current,
        favorites,
      };
      schedulePersist();
    });

    const unsubscribePalette = subscribeToPalette((palette) => {
      preferencesRef.current = {
        ...preferencesRef.current,
        palette,
      };
      schedulePersist();
    });

    return () => {
      unsubscribeFavorites();
      unsubscribePalette();
    };
  }, [schedulePersist, user]);

  const requestMagicLink = useCallback(async (email: string) => {
    await requestMagicLinkRequest(email);
  }, []);

  const verifyMagicLink = useCallback(async (token: string) => {
    syncEnabledRef.current = false;
    const result = await verifyMagicLinkRequest(token);
    setUser(result.user);
    setStatus("authenticated");
    await applyRemotePreferences();
    syncEnabledRef.current = true;
  }, [applyRemotePreferences]);

  const logout = useCallback(async () => {
    if (persistTimeoutRef.current) {
      window.clearTimeout(persistTimeoutRef.current);
    }
    await logoutRequest();
    setUser(null);
    setStatus("anonymous");
    setLastSyncAt(null);
    syncEnabledRef.current = false;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      lastSyncAt,
      requestMagicLink,
      verifyMagicLink,
      logout,
    }),
    [lastSyncAt, logout, requestMagicLink, status, user, verifyMagicLink],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
