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

const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "ASN over-ships firm release",
    body: "DESADV · ASN-20619 was rejected by Lucid SAP (±2% overage).",
    time: "12 min ago",
    unread: true,
    href: paths.messageHub,
    tone: "error"
  },
  {
    id: "n2",
    title: "Invoice references unknown PO line",
    body: "INVOIC · INV-2826-3388 needs a line-map fix before resubmit.",
    time: "1 hr ago",
    unread: true,
    href: paths.messageHub,
    tone: "warning"
  },
  {
    id: "n3",
    title: "DELJIT schedule received",
    body: "3 releases arrived for ship-from 0342 — review demand updates.",
    time: "Today 09:02",
    unread: false,
    href: paths.schedules,
    tone: "info"
  },
  {
    id: "n4",
    title: "Compliance ASN test in progress",
    body: "Complete the ASN self-test to unlock the go-live checkpoint.",
    time: "Yesterday",
    unread: false,
    href: paths.compliance,
    tone: "success"
  }
];

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
  onClose: () => void;
  items?: NotificationItem[];
};

export function NotificationPopup({
  onClose,
  items = DEMO_NOTIFICATIONS
}: NotificationPopupProps) {
  const unreadCount = items.filter((item) => item.unread).length;

  return (
    <div
      className="portal-top-dropdown absolute end-0 top-[calc(100%+0.5rem)] z-50 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden"
      role="dialog"
      aria-label="Notifications"
    >
      <div className="flex items-center justify-between gap-3 border-b border-umerco-border px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-umerco-dark">Notifications</p>
          <p className="text-xs text-umerco-muted">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        <button
          type="button"
          className="text-xs font-medium text-umerco-primary hover:underline"
          onClick={onClose}
        >
          Mark all read
        </button>
      </div>

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

          return (
            <li key={item.id} className="border-b border-umerco-border/70 last:border-b-0">
              {item.href ? (
                <Link to={item.href} className={className} onClick={onClose}>
                  {content}
                </Link>
              ) : (
                <button type="button" className={className} onClick={onClose}>
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="border-t border-umerco-border px-4 py-2.5">
        <Link
          to={paths.messageHub}
          className="block text-center text-sm font-medium text-umerco-primary hover:underline"
          onClick={onClose}
        >
          View Message Hub
        </Link>
      </div>
    </div>
  );
}

export function notificationUnreadCount(items: NotificationItem[] = DEMO_NOTIFICATIONS) {
  return items.filter((item) => item.unread).length;
}
