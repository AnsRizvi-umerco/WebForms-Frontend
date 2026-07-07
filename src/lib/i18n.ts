import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";

export type PortalLanguage = "en" | "es";

const PORTAL_LANGUAGES: PortalLanguage[] = ["en", "es"];

export function normalizePortalLanguage(value: string | null | undefined): PortalLanguage {
  if (value === "es") return "es";
  return "en";
}

export function getStoredLanguage(): PortalLanguage {
  if (typeof document === "undefined") return "en";

  const cookieMatch = document.cookie.match(/(?:^|;\s*)portal_lang=([^;]+)/);
  const fromCookie = cookieMatch?.[1];
  const fromStorage = localStorage.getItem("portal_lang");
  return normalizePortalLanguage(fromCookie || fromStorage);
}

export function applyDocumentLanguage(lang: PortalLanguage): void {
  if (typeof document === "undefined") return;

  document.documentElement.lang = lang;
  document.documentElement.dir = "ltr";
  localStorage.setItem("portal_lang", lang);
  document.cookie = `portal_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
}

export async function setPortalLanguage(lang: PortalLanguage): Promise<void> {
  applyDocumentLanguage(lang);
  await i18n.changeLanguage(lang);
}

export { PORTAL_LANGUAGES };

const initialLanguage = getStoredLanguage();
applyDocumentLanguage(initialLanguage);

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      es: { translation: es }
    },
    lng: initialLanguage,
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });
}

export default i18n;
