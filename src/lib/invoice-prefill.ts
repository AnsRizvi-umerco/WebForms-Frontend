type InvoicePrefillLine = {
  poLine: string;
  partNo: string;
  description: string;
  qty: number;
  uom: string;
  unitPrice: number;
};

export type InvoiceOrderPrefill = {
  supplierName: string;
  supplierCode: string;
  tradingPartner: string;
  buyerCompanyName: string;
  facility: string;
  poReference: string;
  currency: string;
  lines: InvoicePrefillLine[];
  facilities: string[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(typeof value === "string" ? value.trim() : value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function mapInvoicePrefillFromOrder(
  raw: unknown,
  fallbackSupplierName: string
): InvoiceOrderPrefill | null {
  const po = asRecord(raw);
  if (!po || !("interchange" in po) || !("payload" in po)) return null;

  const interchange = asRecord(po.interchange) ?? {};
  const payload = asRecord(po.payload) ?? {};
  const shipTo = asRecord(payload.shipTo) ?? {};
  const rawLines = Array.isArray(payload.lines) ? payload.lines : [];
  const facility = text(shipTo.name) || text(shipTo.id) || text(shipTo.city);

  const lines = rawLines.flatMap((entry, index) => {
    const line = asRecord(entry);
    if (!line) return [];
    const partNo = text(line.itemCode);
    if (!partNo) return [];
    return [
      {
        poLine: text(line.lineNo) || String(index + 1).padStart(3, "0"),
        partNo,
        description: text(line.description),
        qty: Math.max(0, Math.round(toNumber(line.quantity))),
        uom: text(line.uom) || "EA",
        unitPrice: toNumber(line.unitPrice)
      }
    ];
  });

  return {
    supplierName: text(payload.vendorName) || fallbackSupplierName,
    supplierCode: text(interchange.receiverId),
    tradingPartner: text(interchange.senderId),
    buyerCompanyName: text(payload.buyerName) || text(shipTo.name),
    facility,
    poReference: text(payload.poNumber),
    currency: text(payload.currency),
    lines,
    facilities: facility ? [facility] : []
  };
}
