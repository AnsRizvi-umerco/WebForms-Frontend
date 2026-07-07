

import { useTransition } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CalendarClock,
  FileCode2,
  LayoutDashboard,
  Tag,
  type LucideIcon
} from "lucide-react";
import { Loader } from "@/components/umerco/Loader";
import { paths } from "@/paths";

type NavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
};

function NavLink({
  item,
  label,
  active
}: {
  item: NavItem;
  label: string;
  active: boolean;
}) {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => {
        if (active) return;
        startTransition(() => {
          navigate(item.href);
        });
      }}
      aria-busy={isPending}
      aria-current={active ? "page" : undefined}
      className={`portal-nav-link flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
        active
          ? "portal-nav-link-active shadow-sm"
          : isPending
            ? "bg-white/10 text-white"
            : ""
      }`}
    >
      {isPending ? (
        <Loader size="xs" variant="light" className="!w-[18px]" />
      ) : (
        <Icon size={18} strokeWidth={1.75} />
      )}
      {label}
    </button>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const pathname = useLocation().pathname;

  const mainLinks: NavItem[] = [
    { href: paths.dashboard, labelKey: "nav.dashboard", icon: LayoutDashboard },
    { href: paths.schedules, labelKey: "nav.schedulesShort", icon: CalendarClock },
    { href: paths.labels, labelKey: "nav.labels", icon: Tag },
    { href: paths.edifact, labelKey: "nav.edifact", icon: FileCode2 }
  ];

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 top-14 z-30 bg-gray-900/60 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        id="portal-sidebar"
        aria-hidden={!open}
        className={`portal-sidebar fixed bottom-0 left-0 top-14 z-40 flex h-[calc(100dvh-3.5rem)] w-64 flex-col overflow-hidden transition-all duration-300 ease-in-out md:sticky md:z-20 ${
          open
            ? "translate-x-0 md:w-64"
            : "-translate-x-full pointer-events-none md:w-0 md:translate-x-0"
        }`}
      >
        <nav className="flex w-64 flex-1 flex-col gap-1 overflow-y-auto p-4 pt-5">
          {mainLinks.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              label={t(item.labelKey)}
              active={pathname === item.href}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}
