const SESSION_KEY = "supplier_portal_session";
const ACCESS_TOKEN_KEY = "access_token";
const AUTH_USER_KEY = "auth_user";
const SIGNED_OUT_KEY = "portal_signed_out";
export const AUTH_SESSION_CLEARED_EVENT = "auth-session-cleared";

export type PortalActor = "partner_admin" | "supplier";

export type PortalAuthUser = {
  id: string;
  actor: PortalActor;
  business_partner_id: string;
  business_partner_name: string;
  business_partner_code: string;
  email: string;
  full_name: string;
  mutually_defined_zz: string | null;
  duns: string | null;
  as2: string | null;
  company_mutually_defined_zz: string | null;
  company_duns: string | null;
  company_as2: string | null;
  channel_url: string | null;
  inbound_url: string | null;
  comms_username: string | null;
  comms_password: string | null;
  document_types: string[];
  supplier_count?: number;
};

export type AuthSession = {
  access_token: string;
  user: PortalAuthUser;
};

/** @deprecated Use AuthSession */
export type LoginResponse = AuthSession;

export function normalizePortalAuthUser(user: PortalAuthUser): PortalAuthUser {
  return {
    id: user.id,
    actor: user.actor,
    business_partner_id: user.business_partner_id,
    business_partner_name: user.business_partner_name,
    business_partner_code: user.business_partner_code,
    email: user.email,
    full_name: user.full_name,
    mutually_defined_zz: user.mutually_defined_zz ?? null,
    duns: user.duns ?? null,
    as2: user.as2 ?? null,
    company_mutually_defined_zz: user.company_mutually_defined_zz ?? null,
    company_duns: user.company_duns ?? null,
    company_as2: user.company_as2 ?? null,
    channel_url: user.channel_url ?? null,
    inbound_url: user.inbound_url ?? null,
    comms_username: user.comms_username ?? null,
    comms_password: user.comms_password ?? null,
    document_types: Array.isArray(user.document_types) ? user.document_types : [],
    supplier_count: user.supplier_count
  };
}

let signedOutThisLoad = false;

function isSignedOut(): boolean {
  if (signedOutThisLoad) return true;
  try {
    return sessionStorage.getItem(SIGNED_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

function markSignedOut(): void {
  signedOutThisLoad = true;
  try {
    sessionStorage.setItem(SIGNED_OUT_KEY, "1");
  } catch {
    /* ignore */
  }
}

function clearSignedOut(): void {
  signedOutThisLoad = false;
  try {
    sessionStorage.removeItem(SIGNED_OUT_KEY);
  } catch {
    /* ignore */
  }
}

function readSession(): AuthSession | null {
  if (isSignedOut()) return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as AuthSession;
    if (!session.access_token || !session.user?.email) return null;
    return { ...session, user: normalizePortalAuthUser(session.user) };
  } catch {
    return null;
  }
}

function writeSession(session: AuthSession): void {
  if (isSignedOut()) return;
  const next = { ...session, user: normalizePortalAuthUser(session.user) };
  localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  localStorage.setItem(ACCESS_TOKEN_KEY, next.access_token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(next.user));
}

function clearStoredSession(): void {
  markSignedOut();
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getAuthSession(): AuthSession | null {
  if (isSignedOut()) return null;

  const session = readSession();
  if (session) return session;

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const userRaw = localStorage.getItem(AUTH_USER_KEY);
  if (!token || !userRaw) return null;

  try {
    const user = JSON.parse(userRaw) as PortalAuthUser;
    const migrated = { access_token: token, user };
    writeSession(migrated);
    return migrated;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return getAuthSession()?.access_token ?? null;
}

export function getAuthUser(): PortalAuthUser | null {
  return getAuthSession()?.user ?? null;
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export function setAuthSession(session: AuthSession): void {
  clearSignedOut();
  writeSession(session);
}

/** Update a live session. Does not write if the user just signed out. */
export function persistAuthSession(session: AuthSession): void {
  writeSession(session);
}

export function clearAuthSession(): void {
  clearStoredSession();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_CLEARED_EVENT));
  }
}
