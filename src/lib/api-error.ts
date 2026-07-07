export function extractApiError(data: unknown, fallback = "Request failed"): string {
  if (data == null) return fallback;
  if (typeof data === "string" && data.trim()) return data;

  if (typeof data !== "object") return fallback;

  const record = data as Record<string, unknown>;
  const error = record.error;

  if (typeof error === "string" && error.trim()) return error;

  if (error && typeof error === "object") {
    const flattened = error as { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
    if (flattened.formErrors?.[0]) return flattened.formErrors[0];
    const firstField = Object.values(flattened.fieldErrors ?? {}).flat()[0];
    if (firstField) return firstField;
  }

  if (typeof record.message === "string" && record.message.trim()) return record.message;

  return fallback;
}

export function isApiSuccess(data: unknown): boolean {
  if (data == null || typeof data !== "object") return true;
  if ("success" in data) return (data as { success?: boolean }).success !== false;
  return true;
}
