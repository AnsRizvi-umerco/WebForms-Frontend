import type { ReactNode } from "react";

export function Collapse({
  open,
  children,
  id
}: {
  open: boolean;
  children: ReactNode;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
      aria-hidden={!open}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
