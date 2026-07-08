

import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BarChart3, FileCheck, Lock, Mail, Truck } from "lucide-react";
import { LoginField } from "@/components/forms/LoginField";
import { LanguageToggle } from "@/components/language-toggle";
import { Loader } from "@/components/umerco/Loader";
import { ReportIssueWidget } from "@/components/ReportIssueWidget";
import { useToast } from "@/components/umerco/toast";
import { btnPrimaryLg } from "@/components/umerco/styles";
import { paths } from "@/paths";
import { getSupabase } from "@/lib/supabase";

const highlights = [
  { key: "login.feature.schedules", icon: Truck },
  { key: "login.feature.edi", icon: FileCheck },
  { key: "login.feature.analytics", icon: BarChart3 }
] as const;

const LOGO_LIGHT_SRC = "/logo/logo-light.svg";
const LOGO_DARK_SRC = "/logo/logo-dark.svg";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const supabase = getSupabase();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
        toast.error(authError.message);
        return;
      }
      toast.success(t("login.success", { defaultValue: "Signed in successfully." }));
      navigate(paths.dashboard);
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <section className="login-brand-panel relative flex flex-col justify-between bg-gray-900 lg:w-[46%] xl:w-[48%]">
        <div className="login-grid pointer-events-none absolute inset-0 opacity-25" aria-hidden />
        <div className="pointer-events-none absolute inset-y-0 end-0 w-px bg-white/10" aria-hidden />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-8 py-12 lg:px-14 lg:py-16">
          <img
            src={LOGO_LIGHT_SRC}
            alt={t("login.subtitle")}
            className="h-10 w-auto max-w-[220px] object-contain object-left rtl:object-right"
          />
          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-blue-400">
            {t("login.title")}
          </p>

          <h1 className="login-brand-title mt-8 max-w-md text-3xl font-semibold leading-tight tracking-tight text-white lg:text-4xl">
            {t("login.headline")}
          </h1>
          <p className="login-brand-copy mt-4 max-w-sm text-sm leading-relaxed text-gray-400">
            {t("login.description")}
          </p>

          <ul className="mt-10 space-y-0 border-t border-white/10">
            {highlights.map(({ key, icon: Icon }) => (
              <li
                key={key}
                className="flex items-center gap-3.5 border-b border-white/10 py-4 text-sm text-gray-300"
              >
                <Icon className="h-4 w-4 shrink-0 text-blue-400" strokeWidth={1.75} />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 hidden px-14 pb-8 text-xs text-gray-500 lg:block">
          © {new Date().getFullYear()} {t("login.subtitle")}. {t("login.rights")}
        </p>
      </section>

      <section className="flex flex-1 flex-col bg-umerco-canvas">
        <header className="flex items-center justify-between border-b border-umerco-border bg-umerco-surface px-6 py-4 lg:border-none lg:bg-transparent lg:justify-end lg:px-10 lg:pt-6">
          <img
            src={LOGO_DARK_SRC}
            alt={t("login.subtitle")}
            className="h-7 w-auto object-contain object-left rtl:object-right lg:hidden"
          />
          <LanguageToggle />
        </header>

        <div className="flex flex-1 items-center justify-center px-6 pb-10 lg:px-10">
          <div className="w-full max-w-[440px]">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-umerco-dark">{t("login.welcome")}</h2>
              <p className="mt-1.5 text-sm text-umerco-muted">{t("login.welcomeHint")}</p>
            </div>

            <div className="auth-form-card p-7 lg:p-8">
              <form className="space-y-5" onSubmit={onSubmit} noValidate>
                <LoginField
                  label={t("login.email")}
                  icon={<Mail className="h-4 w-4" strokeWidth={1.75} />}
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  disabled={pending}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("login.emailPlaceholder")}
                  error={Boolean(error)}
                />

                <LoginField
                  label={t("login.password")}
                  icon={<Lock className="h-4 w-4" strokeWidth={1.75} />}
                  showPasswordToggle
                  showPasswordLabel={t("login.showPassword")}
                  hidePasswordLabel={t("login.hidePassword")}
                  name="password"
                  autoComplete="current-password"
                  required
                  disabled={pending}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.passwordPlaceholder")}
                  error={Boolean(error)}
                />

                <div className="flex justify-end">
                  <Link
                    to={paths.forgotPassword}
                    className="text-sm font-medium text-umerco-primary hover:underline"
                  >
                    {t("login.forgotPassword")}
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className={`${btnPrimaryLg} login-submit-btn h-12 w-full gap-2.5 disabled:opacity-80`}
                >
                  {pending ? (
                    <>
                      <Loader size="xs" variant="light" />
                      <span>{t("login.signingIn")}</span>
                    </>
                  ) : (
                    t("button.login")
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <ReportIssueWidget defaultCategory="login_access" />
    </main>
  );
}
