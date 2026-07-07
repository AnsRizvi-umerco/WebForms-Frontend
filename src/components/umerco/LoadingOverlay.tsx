import { Loader } from "./Loader";

type LoadingOverlayProps = {
  message?: string;
  className?: string;
};

export function LoadingOverlay({ message, className = "" }: LoadingOverlayProps) {
  return (
    <div
      className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded border border-umerco-border bg-umerco-white/85 ${className}`.trim()}
      aria-busy="true"
      aria-live="polite"
    >
      <Loader />
      {message ? <p className="text-sm font-medium text-umerco-dark">{message}</p> : null}
    </div>
  );
}
