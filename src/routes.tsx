import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PageFallback } from "@/components/umerco/PageFallback";
import { PortalLayout } from "@/layouts/PortalLayout";
import { ProtectedRoute } from "@/layouts/ProtectedRoute";
import { SupplierRoute } from "@/layouts/SupplierRoute";
import LoginPage from "@/pages/LoginPage";
import { paths } from "@/paths";

export { paths } from "@/paths";

const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const CompliancePage = lazy(() => import("@/pages/CompliancePage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const EdifactPage = lazy(() => import("@/pages/EdifactPage"));
const LabelsPage = lazy(() => import("@/pages/LabelsPage"));
const MessageHubPage = lazy(() => import("@/pages/MessageHubPage"));
const TransactionsPage = lazy(() => import("@/pages/TransactionsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const SchedulesPage = lazy(() => import("@/pages/SchedulesPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const SubmitAsnPage = lazy(() => import("@/pages/SubmitAsnPage"));
const SubmitInvoicePage = lazy(() => import("@/pages/SubmitInvoicePage"));
const SubmitPoackPage = lazy(() => import("@/pages/SubmitPoackPage"));
const SubmitScheduleAckPage = lazy(() => import("@/pages/SubmitScheduleAckPage"));
const CreateSupplierPage = lazy(() => import("@/pages/CreateSupplierPage"));
const ViewSuppliersPage = lazy(() => import("@/pages/ViewSuppliersPage"));
const EditSupplierPage = lazy(() => import("@/pages/EditSupplierPage"));

type AppRoute = {
  path: string;
  element: React.ReactNode;
};

/** Routes available without authentication. */
export const unauthRoutes: AppRoute[] = [
  {
    path: paths.login,
    element: <LoginPage />
  },
  {
    path: paths.forgotPassword,
    element: (
      <Suspense fallback={<PageFallback message="Loading…" />}>
        <ForgotPasswordPage />
      </Suspense>
    )
  }
];

/** Routes that require an authenticated supplier session. */
export const authRoutes: AppRoute[] = [
  { path: paths.schedules, element: <SchedulesPage /> },
  { path: paths.dashboard, element: <DashboardPage /> },
  { path: paths.edifact, element: <EdifactPage /> },
  { path: paths.compliance, element: <CompliancePage /> },
  { path: paths.messageHub, element: <MessageHubPage /> },
  { path: paths.transactions, element: <TransactionsPage /> },
  { path: paths.profile, element: <ProfilePage /> },
  { path: paths.settings, element: <SettingsPage /> },
  { path: paths.suppliers.list, element: <ViewSuppliersPage /> },
  { path: paths.suppliers.create, element: <CreateSupplierPage /> },
  { path: "/suppliers/:supplierId/edit", element: <EditSupplierPage /> },
  { path: paths.submit.asn, element: <SubmitAsnPage /> },
  { path: paths.submit.invoice, element: <SubmitInvoicePage /> },
  { path: paths.submit.poack, element: <SubmitPoackPage /> },
  { path: paths.submit.scheduleAck, element: <SubmitScheduleAckPage /> }
];

export function AppRoutes() {
  return (
    <Routes>
      {unauthRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      <Route element={<ProtectedRoute />}>
        <Route element={<PortalLayout />}>
          <Route path={paths.home} element={<Navigate to={paths.dashboard} replace />} />
          {authRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route element={<SupplierRoute />}>
            <Route path={paths.labels} element={<LabelsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={paths.login} replace />} />
    </Routes>
  );
}
