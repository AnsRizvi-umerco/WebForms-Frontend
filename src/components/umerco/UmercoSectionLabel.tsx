type UmercoSectionLabelProps = {
  children: React.ReactNode;
  className?: string;
};

export function UmercoSectionLabel({ children, className = "" }: UmercoSectionLabelProps) {
  return <p className={`umerco-section-label ${className}`.trim()}>{children}</p>;
}
