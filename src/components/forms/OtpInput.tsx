import { ClipboardEvent, KeyboardEvent, useId, useRef } from "react";

const OTP_LENGTH = 6;

type OtpInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
};

export function OtpInput({ label, value, onChange, disabled = false, error = false }: OtpInputProps) {
  const id = useId();
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? "");

  const updateDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join("").slice(0, OTP_LENGTH));
  };

  const focusInput = (index: number) => {
    const input = inputsRef.current[index];
    if (input) {
      input.focus();
      input.select();
    }
  };

  const onDigitChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    updateDigit(index, digit);
    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      updateDigit(index - 1, "");
      focusInput(index - 1);
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    onChange(pasted);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  return (
    <div className="space-y-2">
      <label id={`${id}-label`} className="block text-sm font-medium text-umerco-dark">
        {label}
      </label>

      <div
        className="flex justify-between gap-2"
        role="group"
        aria-labelledby={`${id}-label`}
        aria-label={label}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputsRef.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`${label} digit ${index + 1}`}
            onChange={(event) => onDigitChange(index, event.target.value)}
            onKeyDown={(event) => onKeyDown(index, event)}
            onPaste={onPaste}
            onFocus={(event) => event.target.select()}
            className={[
              "h-12 w-full max-w-[3.25rem] rounded-lg border bg-umerco-white text-center text-lg font-semibold text-umerco-dark shadow-sm outline-none transition-all",
              "focus:border-umerco-primary focus:ring-2 focus:ring-umerco-primary/20",
              error ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-umerco-border",
              disabled ? "cursor-not-allowed opacity-60" : ""
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
