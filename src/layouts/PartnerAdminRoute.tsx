import { Navigate, Outlet } from "react-router-dom";
import { usePortalRole } from "@/hooks/usePortalRole";
import { paths } from "@/paths";

export function PartnerAdminRoute() {
  const { isPartnerAdmin, roleReady } = usePortalRole();

  if (!roleReady) {
    return null;
  }

  if (!isPartnerAdmin) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return <Outlet />;
}
