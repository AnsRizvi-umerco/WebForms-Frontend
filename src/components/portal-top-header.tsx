import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bell,
  ChevronDown,
  Globe,
  LogOut,
  Menu,
  PanelLeftClose,
  Settings,
  UserCircle
} from "lucide-react";
import { apiRoutes, http } from "@/api";
import { NotificationPopup, notificationUnreadCount } from "@/components/NotificationPopup";
import { paths } from "@/paths";
import { setPortalLanguage, type PortalLanguage } from "@/lib/i18n";
import { getSupabase } from "@/lib/supabase";

const LOGO_LIGHT_SRC = "/logo/logo-light.svg";

type HeaderProfile = {
  name: string;
  code: string;
  defaultFacility: string | null;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function shipFromLabel(profile: HeaderProfile): string {
  if (profile.defaultFacility) {
    return `ship-from ${profile.code} · ${profile.defaultFacility}`;
  }
  return `ship-from ${profile.code}`;
}

export function PortalTopHeader({
  menuOpen,
  onMenuToggle
}: {
  menuOpen: boolean;
  onMenuToggle: () => void;
}) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const supabase = getSupabase();
  const [profile, setProfile] = useState<HeaderProfile | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const unreadCount = notificationUnreadCount();

  const currentLang: PortalLanguage = i18n.language === "es" ? "es" : "en";
  const langShort = currentLang === "es" ? "ES" : "EN";

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const [profileRes, settingsRes] = await Promise.all([
          http.get(apiRoutes.profile),
          http.get(apiRoutes.settings.root)
        ]);

        if (cancelled || !profileRes.ok) return;

        const profileJson = (await profileRes.json()) as { name?: string; code?: string };
        let defaultFacility: string | null = null;

        if (settingsRes.ok) {
          const settingsJson = (await settingsRes.json()) as { default_facility?: string | null };
          defaultFacility = settingsJson.default_facility ?? null;
        }

        setProfile({
          name: profileJson.name ?? t("login.subtitle"),
          code: profileJson.code ?? "—",
          defaultFacility
        });
      } catch {
        if (!cancelled) {
          setProfile({
            name: t("login.subtitle"),
            code: "—",
            defaultFacility: null
          });
        }
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const onLogout = async () => {
    setProfileOpen(false);
    await supabase.auth.signOut();
    navigate(paths.login);
  };

  const onLanguageChange = (lang: PortalLanguage) => {
    setLangOpen(false);
    if (lang === currentLang) return;
    void setPortalLanguage(lang);
  };

  return (
    <header className="portal-top-header sticky top-0 z-50 h-14 shrink-0">
      <div className="flex h-full items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className={`portal-top-icon-btn portal-top-menu-btn ${menuOpen ? "portal-top-menu-btn-open" : ""}`}
            aria-label={menuOpen ? t("shell.closeMenu") : t("shell.openMenu")}
            aria-expanded={menuOpen}
            aria-controls="portal-sidebar"
            onClick={onMenuToggle}
          >
            {menuOpen ? (
              <PanelLeftClose className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            )}
          </button>

          <Link to={paths.schedules} className="flex min-w-0 items-center gap-3">
            <img
              src={LOGO_LIGHT_SRC}
              alt={t("login.subtitle")}
              className="h-7 w-auto shrink-0 object-contain"
            />
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm leading-tight">
                <span className="font-semibold text-white">{t("login.subtitle")}</span>{" "}
                <span className="font-normal text-gray-400">{t("login.title")}</span>
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative" ref={langRef}>
            <button
              type="button"
              className="portal-top-lang-btn"
              aria-expanded={langOpen}
              aria-haspopup="listbox"
              onClick={() => {
                setLangOpen((open) => !open);
                setProfileOpen(false);
                setNotificationsOpen(false);
              }}
            >
              <Globe className="h-4 w-4 text-gray-400" strokeWidth={1.75} />
              <span className="text-sm font-medium text-gray-200">{langShort}</span>
              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform ${langOpen ? "rotate-180" : ""}`}
                strokeWidth={1.75}
              />
            </button>

            {langOpen ? (
              <div className="portal-top-dropdown absolute end-0 top-[calc(100%+0.5rem)] z-50 min-w-[10rem] py-1" role="listbox">
                <button
                  type="button"
                  role="option"
                  aria-selected={currentLang === "en"}
                  className={`portal-top-dropdown-item w-full ${currentLang === "en" ? "portal-top-dropdown-item-active" : ""}`}
                  onClick={() => onLanguageChange("en")}
                >
                  English
                </button>
                <button
                  type="button"
                  role="option"
                  aria-selected={currentLang === "es"}
                  className={`portal-top-dropdown-item w-full ${currentLang === "es" ? "portal-top-dropdown-item-active" : ""}`}
                  onClick={() => onLanguageChange("es")}
                >
                  Español
                </button>
              </div>
            ) : null}
          </div>

          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              className="portal-top-icon-btn relative"
              aria-label={t("shell.notifications")}
              aria-expanded={notificationsOpen}
              aria-haspopup="dialog"
              onClick={() => {
                setNotificationsOpen((open) => !open);
                setLangOpen(false);
                setProfileOpen(false);
              }}
            >
              <Bell className="h-4 w-4" strokeWidth={1.75} />
              {unreadCount > 0 ? (
                <span className="portal-top-notification-badge">{unreadCount}</span>
              ) : null}
            </button>

            {notificationsOpen ? (
              <NotificationPopup onClose={() => setNotificationsOpen(false)} />
            ) : null}
          </div>

          <div className="hidden h-8 w-px bg-white/10 sm:block" aria-hidden />

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              className="portal-top-profile-btn"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              onClick={() => {
                setProfileOpen((open) => !open);
                setLangOpen(false);
                setNotificationsOpen(false);
              }}
            >
              <span className="portal-top-avatar">{initials(profile?.name ?? t("login.subtitle"))}</span>
              <span className="hidden min-w-0 text-left md:block">
                <span className="block truncate text-sm font-semibold text-white">
                  {profile?.name ?? t("login.subtitle")}
                </span>
                <span className="block truncate text-xs text-gray-400">
                  {profile ? shipFromLabel(profile) : t("shell.loadingProfile")}
                </span>
              </span>
              <ChevronDown
                className={`hidden h-4 w-4 shrink-0 text-gray-500 transition-transform md:block ${profileOpen ? "rotate-180" : ""}`}
                strokeWidth={1.75}
              />
            </button>

            {profileOpen ? (
              <div className="portal-top-dropdown absolute end-0 top-[calc(100%+0.5rem)] z-50 min-w-[12rem] py-1" role="menu">
                <Link
                  to={paths.profile}
                  className="portal-top-dropdown-item flex items-center gap-2"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                >
                  <UserCircle className="h-4 w-4" strokeWidth={1.75} />
                  {t("nav.profile")}
                </Link>
                <Link
                  to={paths.settings}
                  className="portal-top-dropdown-item flex items-center gap-2"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings className="h-4 w-4" strokeWidth={1.75} />
                  {t("nav.settings")}
                </Link>
                <div className="my-1 border-t border-umerco-border/70" />
                <button
                  type="button"
                  className="portal-top-dropdown-item flex w-full items-center gap-2 text-red-600"
                  role="menuitem"
                  onClick={() => void onLogout()}
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.75} />
                  {t("button.logout")}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
