import { InputHTMLAttributes, ReactNode, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type LoginFieldProps = {
  label: string;
  icon: ReactNode;
  error?: boolean;
  showPasswordToggle?: boolean;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    type?: InputHTMLAttributes<HTMLInputElement>["type"];
  };

export function LoginField({
  label,
  icon,
  error = false,
  showPasswordToggle = false,
  showPasswordLabel = "Show password",
  hidePasswordLabel = "Hide password",
  type = "text",
  className = "",
  disabled,
  ...inputProps
}: LoginFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = showPasswordToggle || type === "password";
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-umerco-dark">
        {label}
      </label>

      <div
        className={[
          "flex h-12 items-stretch overflow-hidden rounded-xl border border-umerco-border bg-umerco-white shadow-sm transition-all",
          "focus-within:ring-2 focus-within:ring-umerco-primary/20",
          error
            ? "border-red-300 focus-within:border-red-400"
            : "border-umerco-border focus-within:border-umerco-primary",
          disabled ? "cursor-not-allowed opacity-60" : ""
        ].join(" ")}
      >
        <span
          className="flex w-11 shrink-0 items-center justify-center border-e border-umerco-border bg-umerco-canvas/80 text-umerco-muted"
          aria-hidden
        >
          {icon}
        </span>

        <input
          id={id}
          type={inputType}
          disabled={disabled}
          className={[
            "min-w-0 flex-1 bg-transparent px-3.5 text-sm text-umerco-dark outline-none",
            "placeholder:text-umerco-muted/50 disabled:cursor-not-allowed",
            className
          ].join(" ")}
          {...inputProps}
        />

        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => setVisible((v) => !v)}
            className="flex w-11 shrink-0 items-center justify-center border-s border-umerco-border text-umerco-muted transition-colors hover:text-umerco-dark disabled:cursor-not-allowed"
            aria-label={visible ? hidePasswordLabel : showPasswordLabel}
          >
            {visible ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
          </button>
        ) : null}
      </div>
    </div>
  );
}
