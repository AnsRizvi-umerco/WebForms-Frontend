import { useEffect, useRef } from "react";

type TableCheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export function TableCheckbox({
  checked,
  indeterminate = false,
  onChange,
  label
}: TableCheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate && !checked;
    }
  }, [checked, indeterminate]);

  return (
    <label className="inline-flex h-9 w-9 cursor-pointer items-center justify-center">
      <input
        ref={inputRef}
        type="checkbox"
        className="umerco-checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        aria-label={label}
      />
    </label>
  );
}
