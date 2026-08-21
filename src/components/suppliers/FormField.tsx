import type { ReactNode } from "react";

export function FormField({
  label,
  htmlFor,
  hint,
  children,
  className = ""
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`form-field ${className}`.trim()}>
      <label htmlFor={htmlFor} className="form-field-label">
        {label}
      </label>
      {children}
      {hint ? <p className="form-field-hint">{hint}</p> : null}
    </div>
  );
}

export function FormSection({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="form-section">
      <div className="form-section-header">
        <h2 className="form-section-title">{title}</h2>
        {description ? <p className="form-section-description">{description}</p> : null}
      </div>
      <div className="form-section-body">{children}</div>
    </section>
  );
}
