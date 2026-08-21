import { getAccessToken } from "@/lib/auth";
import { getMasterPortalBaseUrl } from "@/lib/master-portal";

const SUPPLIER_PORTAL_BASE = "/api/supplier-portal";

export type SupplierStatus = "invited" | "active" | "suspended";

export const SUPPLIER_DOCUMENT_TYPES = ["ORDRSP", "INVOIC", "DESADV", "APERAK"] as const;

export type SupplierDocumentType = (typeof SUPPLIER_DOCUMENT_TYPES)[number];

export const SUPPLIER_DOCUMENT_TYPE_OPTIONS: {
  value: SupplierDocumentType;
  labelKey: string;
}[] = [
  { value: "ORDRSP", labelKey: "suppliers.docTypePoAck" },
  { value: "INVOIC", labelKey: "suppliers.docTypeInvoice" },
  { value: "DESADV", labelKey: "suppliers.docTypeAsn" },
  { value: "APERAK", labelKey: "suppliers.docTypeScheduleAck" }
];

export type ManagedSupplier = {
  id: string;
  business_partner_id: string;
  full_name: string;
  email: string;
  status: SupplierStatus;
  first_login_at: string | null;
  mutually_defined_zz: string | null;
  duns: string | null;
  as2: string | null;
  channel_url: string | null;
  inbound_url: string | null;
  comms_username: string | null;
  comms_password: string | null;
  document_types: SupplierDocumentType[];
  created_at: string;
  updated_at: string;
};

export type PortalMeUser = {
  id: string;
  actor: "partner_admin" | "supplier";
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
  document_types: SupplierDocumentType[];
  supplier_count: number;
};

export type UpdatePortalProfileInput = {
  full_name?: string;
  mutually_defined_zz?: string | null;
  duns?: string | null;
  as2?: string | null;
};

export type CreateSupplierInput = {
  full_name: string;
  email: string;
  password: string;
  mutually_defined_zz: string;
  duns: string;
  as2: string;
  channel_url: string;
  comms_username?: string | null;
  comms_password?: string | null;
  document_types: SupplierDocumentType[];
};

export type UpdateSupplierInput = {
  full_name?: string;
  email?: string;
  password?: string;
  status?: SupplierStatus;
  mutually_defined_zz?: string | null;
  duns?: string | null;
  as2?: string | null;
  channel_url?: string | null;
  comms_username?: string | null;
  comms_password?: string | null;
  document_types?: SupplierDocumentType[];
};

async function supplierPortalRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${getMasterPortalBaseUrl()}${SUPPLIER_PORTAL_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });

  const body = (await response.json().catch(() => null)) as
    | T
    | { error?: string; message?: string }
    | null;

  if (!response.ok) {
    const message =
      (body && typeof body === "object" && "error" in body && body.error) ||
      (body && typeof body === "object" && "message" in body && body.message) ||
      "Request failed";
    throw new Error(message);
  }

  return body as T;
}

export async function getPortalMe(): Promise<PortalMeUser> {
  return supplierPortalRequest<PortalMeUser>("/me");
}

export async function updatePortalProfile(
  input: UpdatePortalProfileInput
): Promise<PortalMeUser> {
  return supplierPortalRequest<PortalMeUser>("/me", {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export async function listSuppliers(): Promise<ManagedSupplier[]> {
  const result = await supplierPortalRequest<{ items: ManagedSupplier[] }>("/suppliers");
  return result.items ?? [];
}

export async function getSupplier(supplierId: string): Promise<ManagedSupplier> {
  return supplierPortalRequest<ManagedSupplier>(
    `/suppliers/${encodeURIComponent(supplierId)}`
  );
}

export async function createSupplier(input: CreateSupplierInput): Promise<ManagedSupplier> {
  return supplierPortalRequest<ManagedSupplier>("/suppliers", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function updateSupplier(
  supplierId: string,
  input: UpdateSupplierInput
): Promise<ManagedSupplier> {
  return supplierPortalRequest<ManagedSupplier>(
    `/suppliers/${encodeURIComponent(supplierId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(input)
    }
  );
}

export async function deleteSupplier(supplierId: string): Promise<void> {
  await supplierPortalRequest<{ message: string }>(
    `/suppliers/${encodeURIComponent(supplierId)}`,
    { method: "DELETE" }
  );
}
