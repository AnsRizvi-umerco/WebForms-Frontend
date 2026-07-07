import { Loader } from "./Loader";

type LoadingBlockProps = {
  message?: string;
  variant?: "centered" | "banner";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function LoadingBlock({
  message,
  variant = "centered",
  size = "sm",
  className = ""
}: LoadingBlockProps) {
  const variantClass =
    variant === "banner"
      ? "flex items-center gap-3 rounded-md border border-umerco-border bg-umerco-canvas px-4 py-3"
      : "flex flex-col items-center justify-center gap-3 py-8";

  const messageClass =
    variant === "banner" ? "text-sm text-umerco-dark" : "text-sm font-medium text-umerco-dark";

  return (
    <div className={`${variantClass} ${className}`.trim()} role="status" aria-live="polite">
      <Loader size={size} />
      {message ? <p className={messageClass}>{message}</p> : null}
    </div>
  );
}
