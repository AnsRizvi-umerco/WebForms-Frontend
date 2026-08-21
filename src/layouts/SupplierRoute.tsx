import { Navigate, Outlet } from "react-router-dom";
import { usePortalRole } from "@/hooks/usePortalRole";
import { paths } from "@/paths";

export function SupplierRoute() {
  const { canAccessShippingLabels, roleReady } = usePortalRole();

  if (!roleReady) {
    return null;
  }

  if (!canAccessShippingLabels) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return <Outlet />;
}
