type AsnPrefillLine = {
  poNumber: string;
  poLine: string;
  partNo: string;
  description: string;
  qtyShipped: number;
  uom: string;
  poDate: string;
};

export type AsnOrderPrefill = {
  poNumber: string;
  poDate: string;
  buyerCompanyName: string;
  shipToName: string;
  shipToId: string;
  vendorName: string;
  vendorId: string;
  lines: AsnPrefillLine[];
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

function compactDate(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 8) return digits;
  if (digits.length === 6) return `20${digits}`;
  return "";
}

export function mapAsnPrefillFromOrder(raw: unknown): AsnOrderPrefill | null {
  const po = asRecord(raw);
  if (!po || !("payload" in po)) return null;

  const payload = asRecord(po.payload) ?? {};
  const shipTo = asRecord(payload.shipTo) ?? {};
  const poNumber = text(payload.poNumber);
  const poDate = compactDate(text(payload.poDate));
  const rawLines = Array.isArray(payload.lines) ? payload.lines : [];

  const lines = rawLines.flatMap((entry, index) => {
    const line = asRecord(entry);
    if (!line) return [];
    const partNo = text(line.itemCode);
    if (!partNo) return [];
    return [
      {
        poNumber,
        poLine: text(line.lineNo) || String(index + 1).padStart(3, "0"),
        partNo,
        description: text(line.description) || partNo,
        qtyShipped: Math.max(0, Math.round(toNumber(line.quantity))),
        uom: text(line.uom) || "EA",
        poDate
      }
    ];
  });

  if (!poNumber && lines.length === 0) return null;

  return {
    poNumber,
    poDate,
    buyerCompanyName: text(payload.buyerName) || text(shipTo.name),
    shipToName: text(shipTo.name) || text(payload.buyerName),
    shipToId: text(shipTo.id) || text(payload.buyerId),
    vendorName: text(payload.vendorName),
    vendorId: text(payload.vendorId),
    lines
  };
}
