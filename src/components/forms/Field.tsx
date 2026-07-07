

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <label className="space-y-1">
      <span className="umerco-section-label">{label}</span>
      {children}
    </label>
  );
}
