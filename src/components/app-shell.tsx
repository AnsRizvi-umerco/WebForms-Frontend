

import { useEffect, useState } from "react";
import { PortalTopHeader } from "@/components/portal-top-header";
import { Sidebar } from "@/components/umerco/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="flex min-h-screen flex-col bg-umerco-canvas">
      <PortalTopHeader menuOpen={open} onMenuToggle={() => setOpen((value) => !value)} />

      <div className="flex min-h-0 flex-1">
        <Sidebar open={open} onClose={() => setOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
