/**
 * Convert HTML date input (YYYY-MM-DD), ISO datetime, or YYYYMMDD to compact YYYYMMDD.
 * Returns "" for empty/whitespace input.
 */
export function toCompactYyyymmdd(value: string): string {
  const t = value.trim();
  if (!t) return "";
  if (/^\d{8}$/.test(t)) return t;
  const day = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (day) return `${day[1]}${day[2]}${day[3]}`;
  const digits = t.replace(/\D/g, "");
  if (digits.length >= 8) return digits.slice(0, 8);
  return t;
}

/** Local calendar today as YYYY-MM-DD for HTML date inputs. */
export function todayLocalIsoDateInput(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Normalize any date string to YYYY-MM-DD for `<input type="date">`. */
export function toDateInputValue(value: string | null | undefined): string {
  const compact = toCompactYyyymmdd(value ?? "");
  if (/^\d{8}$/.test(compact)) {
    return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
  }
  return todayLocalIsoDateInput();
}
