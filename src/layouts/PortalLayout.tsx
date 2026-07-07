import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { PageFallback } from "@/components/umerco/PageFallback";

export function PortalLayout() {
  return (
    <AppShell>
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}
