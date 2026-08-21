import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/auth-context";
import { I18nProvider } from "@/components/i18n-provider";
import { ToastProvider } from "@/components/umerco/toast";
import { AppRoutes } from "@/routes";

export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </I18nProvider>
  );
}
