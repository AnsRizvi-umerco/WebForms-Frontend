import { useTranslation } from "react-i18next";
import { Loader } from "@/components/umerco/Loader";
import { useMountedOpen } from "@/hooks/useMountedOpen";

export function SignOutOverlay({ open }: { open: boolean }) {
  const { t } = useTranslation();
  const mounted = useMountedOpen(open, 280);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-[#f0f2f5]/80 backdrop-blur-[6px] ${
        open ? "animate-login-in" : "animate-dropdown-out"
      }`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="auth-form-card flex min-w-[16rem] flex-col items-center gap-4 px-10 py-8">
        <Loader size="md" />
        <div className="text-center">
          <p className="text-sm font-semibold text-umerco-dark">
            {t("login.signingOut", { defaultValue: "Signing out…" })}
          </p>
          <p className="mt-1 text-xs text-umerco-muted">
            {t("login.signingOutHint", { defaultValue: "Please wait a moment." })}
          </p>
        </div>
      </div>
    </div>
  );
}
