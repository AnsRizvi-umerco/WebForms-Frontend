/**
 * Convert HTML date input value (YYYY-MM-DD) or existing YYYYMMDD to compact YYYYMMDD.
 * Returns "" for empty/whitespace input.
 */
export function toCompactYyyymmdd(value: string): string {
  const t = value.trim();
  if (!t) return "";
  if (/^\d{8}$/.test(t)) return t;
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t.replace(/-/g, "");
  return t;
}

/** Local calendar today as YYYYMMDD (for defaulting date inputs via value=YYYY-MM-DD). */
export function todayLocalIsoDateInput(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
