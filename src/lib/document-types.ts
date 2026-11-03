import type { PortalAuthUser } from "@/lib/auth";
import { SUPPLIER_DOCUMENT_TYPES, type SupplierDocumentType } from "@/lib/master-portal-suppliers";

export type OutboundDocumentType = SupplierDocumentType;

const DOCUMENT_LABELS: Record<string, string> = {
  ORDRSP: "PO Acknowledgment",
  INVOIC: "Invoice",
  DESADV: "ASN",
  APERAK: "PO Schedule"
};

export function outboundDocumentLabel(messageType: string): string {
  const key = messageType.trim().toUpperCase();
  return DOCUMENT_LABELS[key] || messageType.trim() || "Document";
}

export function isDocumentTypeAllowed(
  user: PortalAuthUser | null | undefined,
  messageType: string
): boolean {
  if (!user || user.actor !== "supplier") return true;
  return user.document_types.includes(messageType);
}

export function allowedDocumentTypes(user: PortalAuthUser | null | undefined): OutboundDocumentType[] {
  if (!user || user.actor !== "supplier") {
    return [...SUPPLIER_DOCUMENT_TYPES];
  }
  return SUPPLIER_DOCUMENT_TYPES.filter((type) => user.document_types.includes(type));
}
