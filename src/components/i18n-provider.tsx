import "@/lib/i18n";
import { PropsWithChildren, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { applyDocumentLanguage, getStoredLanguage, normalizePortalLanguage } from "@/lib/i18n";

export function I18nProvider({ children }: PropsWithChildren) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const stored = getStoredLanguage();
    if (i18n.language !== stored) {
      void i18n.changeLanguage(stored);
    }
    applyDocumentLanguage(stored);

    const onLanguageChanged = (lang: string) => {
      applyDocumentLanguage(normalizePortalLanguage(lang));
    };

    i18n.on("languageChanged", onLanguageChanged);
    return () => {
      i18n.off("languageChanged", onLanguageChanged);
    };
  }, [i18n]);

  return children;
}
