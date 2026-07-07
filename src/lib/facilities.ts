export type ScheduleLineWithFacility = {
  facility: string;
};

export function uniqueFacilitiesFromLines(lines: ScheduleLineWithFacility[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    const code = line.facility?.trim();
    if (code && !seen.has(code)) {
      seen.add(code);
      result.push(code);
    }
  }
  return result;
}

export function primaryFacilityFromLines(lines: ScheduleLineWithFacility[]): string {
  return uniqueFacilitiesFromLines(lines)[0] ?? "";
}

export function resolveFacilityLabel(code: string): string {
  return code.trim() || "—";
}
