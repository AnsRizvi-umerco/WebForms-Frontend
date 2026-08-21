

import { useEffect, useState, useTransition } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CalendarClock,
  ChevronDown,
  LayoutDashboard,
  List,
  MessagesSquare,
  ScrollText,
  ShieldCheck,
  Tag,
  UserPlus,
  Users,
  type LucideIcon
} from "lucide-react";
import { usePortalRole } from "@/hooks/usePortalRole";
import { Loader } from "@/components/umerco/Loader";
import { paths } from "@/paths";

type NavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
};

const SIDEBAR_WIDTH_CLASS = "w-[17.5rem]";

type NavSubItem = {
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

function NavSubLink({ item, label, active }: { item: NavSubItem; label: string; active: boolean }) {
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
      className={`portal-nav-sublink flex w-full items-center gap-2.5 rounded-lg py-2 pe-3 ps-10 text-left text-sm transition-colors ${
        active ? "portal-nav-sublink-active font-medium" : ""
      }`}
    >
      {isPending ? (
        <Loader size="xs" variant="light" className="!w-4 shrink-0" />
      ) : (
        <Icon size={16} strokeWidth={1.75} className="shrink-0" />
      )}
      <span>{label}</span>
    </button>
  );
}

function SupplierManagementGroup({
  pathname,
  t
}: {
  pathname: string;
  t: (key: string) => string;
}) {
  const supplierPaths = [paths.suppliers.list, paths.suppliers.create];
  const isSupplierRoute = supplierPaths.some(
    (href) => pathname === href || pathname.startsWith(`${href}/`)
  );
  const [open, setOpen] = useState(isSupplierRoute);

  useEffect(() => {
    if (isSupplierRoute) setOpen(true);
  }, [isSupplierRoute]);

  const subLinks: NavSubItem[] = [
    { href: paths.suppliers.create, labelKey: "nav.createSupplier", icon: UserPlus },
    { href: paths.suppliers.list, labelKey: "nav.viewSuppliers", icon: List }
  ];

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={`portal-nav-link flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
          isSupplierRoute ? "text-white" : ""
        }`}
      >
        <Users size={18} strokeWidth={1.75} />
        <span className="min-w-0 flex-1 truncate">{t("nav.supplierManagement")}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="mt-1 flex flex-col gap-0.5">
          {subLinks.map((item) => (
            <NavSubLink
              key={item.href}
              item={item}
              label={t(item.labelKey)}
              active={pathname === item.href}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const pathname = useLocation().pathname;
  const { isPartnerAdmin, canAccessShippingLabels } = usePortalRole();

  const mainLinks: NavItem[] = [
    { href: paths.dashboard, labelKey: "nav.dashboard", icon: LayoutDashboard },
    { href: paths.schedules, labelKey: "nav.schedulesShort", icon: CalendarClock },
    ...(canAccessShippingLabels
      ? [{ href: paths.labels, labelKey: "nav.labels", icon: Tag } satisfies NavItem]
      : []),
    { href: paths.compliance, labelKey: "nav.compliance", icon: ShieldCheck },
    { href: paths.messageHub, labelKey: "nav.messageHub", icon: MessagesSquare },
    { href: paths.transactions, labelKey: "nav.transactions", icon: ScrollText }
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
        className={`portal-sidebar fixed bottom-0 left-0 top-14 z-40 flex h-[calc(100dvh-3.5rem)] ${SIDEBAR_WIDTH_CLASS} flex-col overflow-hidden transition-all duration-300 ease-in-out md:sticky md:z-20 ${
          open
            ? "translate-x-0 md:w-[17.5rem]"
            : "-translate-x-full pointer-events-none md:w-0 md:translate-x-0"
        }`}
      >
        <nav className={`flex ${SIDEBAR_WIDTH_CLASS} flex-1 flex-col gap-1 overflow-y-auto p-4 pt-5`}>
          {mainLinks.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              label={t(item.labelKey)}
              active={pathname === item.href}
            />
          ))}

          {isPartnerAdmin ? <SupplierManagementGroup pathname={pathname} t={t} /> : null}
        </nav>
      </aside>
    </>
  );
}
