type ScheduleFacilityFieldsProps = {
  primaryFacility: string;
  allFacilities: string[];
};

export function ScheduleFacilityFields({
  primaryFacility,
  allFacilities
}: ScheduleFacilityFieldsProps) {
  return (
    <>
      <div>
        <label className="mb-1 block umerco-section-label">Ship-to facility</label>
        <input
          className="umerco-input-readonly font-mono"
          value={primaryFacility || "—"}
          readOnly
        />
      </div>
      {allFacilities.length > 1 ? (
        <p className="text-xs text-umerco-muted">
          This schedule includes multiple facilities ({allFacilities.join(", ")}). Outbound
          documents use <span className="font-mono">{primaryFacility}</span> as the header
          facility.
        </p>
      ) : null}
    </>
  );
}
