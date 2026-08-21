import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { paths } from "@/paths";

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to={paths.login} replace />;

  return <Outlet />;
}
