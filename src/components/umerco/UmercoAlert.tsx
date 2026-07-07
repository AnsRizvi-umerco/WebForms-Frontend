import { alertError, alertInfo, alertWarning } from "./styles";

type UmercoAlertProps = {
  variant?: "error" | "warning" | "info";
  children: React.ReactNode;
  className?: string;
};

const variantClass = {
  error: alertError,
  warning: alertWarning,
  info: alertInfo
} as const;

export function UmercoAlert({ variant = "info", children, className = "" }: UmercoAlertProps) {
  return <div className={`${variantClass[variant]} ${className}`.trim()}>{children}</div>;
}
