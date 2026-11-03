import { Navigate, Outlet } from "react-router-dom";
import { PageFallback } from "@/components/umerco/PageFallback";
import { usePortalRole } from "@/hooks/usePortalRole";
import { paths } from "@/paths";

export function SupplierRoute() {
  const { canAccessShippingLabels, roleReady } = usePortalRole();

  if (!roleReady) {
    return <PageFallback message="Loading shipping labels…" />;
  }

  if (!canAccessShippingLabels) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return <Outlet />;
}
