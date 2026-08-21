import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type DocumentTypeOption = {
  value: string;
  label: string;
};

type DocumentTypeMultiSelectProps = {
  id: string;
  options: DocumentTypeOption[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  selectedLabel: (count: number) => string;
};

export function DocumentTypeMultiSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
  selectedLabel
}: DocumentTypeMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const toggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
      return;
    }
    onChange([...value, optionValue]);
  };

  const summary =
    value.length === 0
      ? placeholder
      : selectedLabel(value.length);

  return (
    <div className="relative" ref={rootRef}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="umerco-input flex w-full items-center justify-between gap-2 text-left"
      >
        <span className={value.length === 0 ? "text-umerco-muted" : "text-umerco-dark"}>
          {summary}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          className={`shrink-0 text-umerco-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-umerco-border bg-white py-1 shadow-lg"
        >
          {options.map((option) => {
            const checked = value.includes(option.value);
            return (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-umerco-dark hover:bg-umerco-beige"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(option.value)}
                  className="rounded border-umerco-border"
                />
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{option.label}</span>
                  <span className="ms-2 font-mono text-xs text-umerco-muted">{option.value}</span>
                </span>
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
