

import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { setPortalLanguage, type PortalLanguage } from "@/lib/i18n";

const LANGUAGES: { code: PortalLanguage; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" }
];

export function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const current = i18n.language === "es" ? "es" : "en";

  const setLang = (lang: PortalLanguage) => {
    if (lang === current) return;
    void setPortalLanguage(lang);
  };

  return (
    <div
      className="smoke-card inline-flex items-center gap-1 rounded-xl p-1"
      role="group"
      aria-label={t("common.language")}
    >
      <span className="flex items-center ps-2 pe-0.5 text-umerco-muted" aria-hidden>
        <Globe className="h-3.5 w-3.5" strokeWidth={1.75} />
      </span>

      {LANGUAGES.map(({ code, label }) => {
        const active = current === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            className={
              active
                ? "language-toggle-active rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                : "language-toggle-inactive rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
