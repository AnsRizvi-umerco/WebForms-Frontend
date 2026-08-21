import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  AUTH_SESSION_CLEARED_EVENT,
  clearAuthSession,
  getAuthSession,
  normalizePortalAuthUser,
  persistAuthSession,
  setAuthSession,
  type AuthSession,
  type PortalAuthUser
} from "@/lib/auth";
import { loginWithMasterPortal } from "@/lib/master-portal";
import { getPortalMe } from "@/lib/master-portal-suppliers";
import { SignOutOverlay } from "@/components/SignOutOverlay";

type AuthContextValue = {
  user: PortalAuthUser | null;
  accessToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signingOut: boolean;
  updateUser: (patch: Partial<PortalAuthUser>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession());
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const syncSession = () => setSession(getAuthSession());
    const handleSessionCleared = () => setSession(null);

    window.addEventListener("storage", syncSession);
    window.addEventListener(AUTH_SESSION_CLEARED_EVENT, handleSessionCleared);
    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener(AUTH_SESSION_CLEARED_EVENT, handleSessionCleared);
    };
  }, []);

  useEffect(() => {
    if (!session?.access_token) return;
    let cancelled = false;

    void getPortalMe()
      .then((me) => {
        if (cancelled) return;
        if (!getAuthSession()) return;
        setSession((current) => {
          if (!current || !getAuthSession()) return null;
          const next = {
            ...current,
            user: normalizePortalAuthUser({
              ...current.user,
              ...me,
              actor: me.actor ?? current.user.actor
            })
          };
          persistAuthSession(next);
          return next;
        });
      })
      .catch(() => {
        /* Keep the stored session if Master Portal /me is unavailable. */
      });

    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  const login = useCallback(async (email: string, password: string) => {
    const nextSession = await loginWithMasterPortal(email, password);
    setAuthSession(nextSession);
    setSession(nextSession);
  }, []);

  const logout = useCallback(async () => {
    if (signingOut) return;
    setSigningOut(true);
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    clearAuthSession();
    setSession(null);
    await new Promise((resolve) => window.setTimeout(resolve, 280));
    setSigningOut(false);
  }, [signingOut]);

  const updateUser = useCallback((patch: Partial<PortalAuthUser>) => {
    setSession((current) => {
      if (!current || !getAuthSession()) return null;
      const next = { ...current, user: { ...current.user, ...patch } };
      persistAuthSession(next);
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.access_token ?? null,
      loading,
      isAuthenticated: Boolean(session?.access_token),
      login,
      logout,
      signingOut,
      updateUser
    }),
    [session, loading, login, logout, signingOut, updateUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SignOutOverlay open={signingOut} />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
