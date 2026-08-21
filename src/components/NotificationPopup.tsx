import { AlertTriangle, CheckCircle2, FileWarning, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { paths } from "@/paths";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
  href?: string;
  tone?: "info" | "warning" | "error" | "success";
};

function ToneIcon({ tone }: { tone: NotificationItem["tone"] }) {
  if (tone === "error") {
    return <AlertTriangle size={16} className="text-red-600" strokeWidth={2} />;
  }
  if (tone === "warning") {
    return <FileWarning size={16} className="text-amber-600" strokeWidth={2} />;
  }
  if (tone === "success") {
    return <CheckCircle2 size={16} className="text-emerald-600" strokeWidth={2} />;
  }
  return <Info size={16} className="text-umerco-primary" strokeWidth={2} />;
}

function toneBg(tone: NotificationItem["tone"]) {
  if (tone === "error") return "bg-red-50";
  if (tone === "warning") return "bg-amber-50";
  if (tone === "success") return "bg-emerald-50";
  return "bg-umerco-primary-soft/60";
}

type NotificationPopupProps = {
  open: boolean;
  onClose: () => void;
  items: NotificationItem[];
  onMarkAllRead?: () => void;
  onItemClick?: (id: string) => void;
};

export function NotificationPopup({
  open,
  onClose,
  items,
  onMarkAllRead,
  onItemClick
}: NotificationPopupProps) {
  const unreadCount = items.filter((item) => item.unread).length;

  return (
    <div
      className={`portal-top-dropdown absolute end-0 top-[calc(100%+0.5rem)] z-50 w-[min(24rem,calc(100vw-1.5rem))] origin-top-right overflow-hidden ${
        open ? "animate-dropdown-in" : "pointer-events-none animate-dropdown-out"
      }`}
      role="dialog"
      aria-label="Notifications"
      aria-hidden={!open}
    >
      <div className="flex items-center justify-between gap-3 border-b border-umerco-border px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-umerco-dark">Notifications</p>
          <p className="text-xs text-umerco-muted">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            className="text-xs font-medium text-umerco-primary hover:underline"
            onClick={() => onMarkAllRead?.()}
          >
            Mark all read
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-umerco-muted">
          No notifications yet. New purchase orders and invoices will appear here.
        </p>
      ) : (
        <ul className="max-h-[22rem] overflow-y-auto py-1">
          {items.map((item) => {
            const content = (
              <>
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${toneBg(item.tone)}`}
                >
                  <ToneIcon tone={item.tone} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-umerco-dark">{item.title}</span>
                    {item.unread ? (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-umerco-primary" />
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-sm text-umerco-muted">{item.body}</span>
                  <span className="mt-1.5 block text-xs text-umerco-muted">{item.time}</span>
                </span>
              </>
            );

            const className = `flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-umerco-beige/80 ${
              item.unread ? "bg-umerco-primary-soft/20" : ""
            }`;

            const handleClick = () => {
              onItemClick?.(item.id);
              onClose();
            };

            const href = item.href || "";
            const [pathname, search = ""] = href.split("?");
            const linkTo = pathname
              ? { pathname, search: search ? `?${search}` : "" }
              : paths.schedules;

            return (
              <li key={item.id} className="border-b border-umerco-border/70 last:border-b-0">
                {pathname ? (
                  <Link to={linkTo} className={className} onClick={handleClick}>
                    {content}
                  </Link>
                ) : (
                  <button type="button" className={className} onClick={handleClick}>
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="border-t border-umerco-border px-4 py-2.5">
        <Link
          to={paths.schedules}
          className="block text-center text-sm font-medium text-umerco-primary hover:underline"
          onClick={onClose}
        >
          View schedules
        </Link>
      </div>
    </div>
  );
}
