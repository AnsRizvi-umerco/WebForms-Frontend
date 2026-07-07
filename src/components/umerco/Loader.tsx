import "./loader.css";

type LoaderProps = {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "dark" | "light";
  className?: string;
};

const sizeMap = { xs: 16, sm: 32, md: 50, lg: 64 };

export function Loader({ size = "md", variant = "dark", className = "" }: LoaderProps) {
  if (size === "xs") {
    return (
      <span
        className={`loader-ring loader-ring-${variant} ${className}`.trim()}
        role="status"
        aria-label="Loading"
      />
    );
  }

  return (
    <div
      className={`loader loader-${variant} ${className}`.trim()}
      style={{ width: sizeMap[size] }}
      role="status"
      aria-label="Loading"
    />
  );
}
