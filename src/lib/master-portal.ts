import { getApiBaseUrl } from "@/api/config";
import { normalizePortalAuthUser, type AuthSession } from "@/lib/auth";

export function getMasterPortalBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_MASTER_PORTAL_BASE_URL?.trim();
  if (!fromEnv) {
    throw new Error("Missing VITE_MASTER_PORTAL_BASE_URL");
  }
  return fromEnv.replace(/\/$/, "");
}

export function outboundApiUrl(companyId: string, supplierId: string): string {
  return `${getApiBaseUrl()}/inbound/${companyId}/${supplierId}`;
}

function shouldReplaceStoredOutboundUrl(stored: string): boolean {
  try {
    const hostname = new URL(stored).hostname.toLowerCase();
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.includes("master-portal")
    );
  } catch {
    return true;
  }
}

export function resolveOutboundApiUrl(
  storedUrl: string | null | undefined,
  companyId: string,
  supplierId: string
): string {
  const canonical = outboundApiUrl(companyId, supplierId);
  const stored = storedUrl?.trim();
  if (!stored || shouldReplaceStoredOutboundUrl(stored)) return canonical;
  return stored;
}

export async function loginWithMasterPortal(
  email: string,
  password: string
): Promise<AuthSession> {
  const response = await fetch(`${getMasterPortalBaseUrl()}/api/supplier-portal/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const body = (await response.json().catch(() => null)) as
    | AuthSession
    | { error?: string; message?: string }
    | null;

  if (!response.ok) {
    const message =
      (body && "error" in body && body.error) ||
      (body && "message" in body && body.message) ||
      "Sign in failed";
    throw new Error(message);
  }

  if (!body || !("access_token" in body) || !body.access_token || !body.user) {
    throw new Error("Invalid login response");
  }

  return {
    access_token: body.access_token,
    user: normalizePortalAuthUser(body.user)
  };
}
