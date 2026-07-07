import { BrowserRouter } from "react-router-dom";
import { I18nProvider } from "@/components/i18n-provider";
import { ToastProvider } from "@/components/umerco/toast";
import { AppRoutes } from "@/routes";

export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </I18nProvider>
  );
}
