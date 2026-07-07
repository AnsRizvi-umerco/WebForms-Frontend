import { card } from "@/components/umerco/styles";
import { UmercoSectionLabel } from "@/components/umerco/UmercoSectionLabel";

export default function LabelsPage() {
  return (
    <div className={`${card} p-4`}>
      <UmercoSectionLabel>Shipping Labels</UmercoSectionLabel>
      <h2 className="mb-3 text-xl font-semibold text-umerco-dark">Shipping Labels</h2>
      <p className="text-sm text-umerco-muted">
        Generated ASN labels will appear here. Use Print All or Download ZPL after generation.
      </p>
    </div>
  );
}
