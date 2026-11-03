export const btnPrimary =
  "btn-primary inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export const btnPrimaryLg =
  "btn-primary-lg inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export const btnSecondary =
  "btn-secondary inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export const btnOutline =
  "btn-outline inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors";

export const btnDark =
  "btn-dark inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export const card = "smoke-card";

export const cardAccent = `${card} border-l-4 border-l-umerco-primary`;

export const tableWrap = "overflow-hidden smoke-card";

export const tableBase = "min-w-full border-separate border-spacing-0 text-left text-sm";

export const tableHeader =
  "table-header-dark border-b border-umerco-border px-3 py-2.5 text-xs font-semibold uppercase tracking-wide";

export const tdBase = "border-b border-umerco-border px-3 py-2.5 text-umerco-dark last:border-b-0";

export const trHover = "transition-colors hover:bg-umerco-beige/80";

export const tableRowCanvas = "bg-umerco-canvas/50";

export const tableRowBeige = "bg-umerco-surface";

export const alertError =
  "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800";

export const alertWarning =
  "rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900";

export const alertInfo =
  "rounded-lg border border-umerco-primary-soft bg-umerco-primary-soft/40 px-4 py-3 text-sm text-umerco-dark";

export const docMixPieColors: Record<string, string> = {
  ORDRSP: "#2563eb",
  "PO ACKNOWLEDGMENT": "#2563eb",
  INVOIC: "#059669",
  INVOICE: "#059669",
  APERAK: "#d97706",
  "PO SCHEDULE": "#d97706",
  DESADV: "#6b7280",
  ASN: "#6b7280"
};

export const docMixPieColorFallback = "#111827";

export function docMixPieColor(docType: string): string {
  return docMixPieColors[docType.toUpperCase()] ?? docMixPieColorFallback;
}

export const chartInbound = "#2563eb";
export const chartOutbound = "#059669";

export function statusPill(status: string): string {
  const base = "rounded-full px-2.5 py-1 text-xs font-medium";
  if (status === "invoice_sent" || status === "completed") return `${base} status-pill-completed`;
  if (status === "acknowledged") return `${base} status-pill-acknowledged`;
  return `${base} status-pill-pending`;
}

export function tableRowClass(index: number): string {
  return index % 2 === 0 ? tableRowCanvas : tableRowBeige;
}
