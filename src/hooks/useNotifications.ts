import { useCallback, useEffect, useRef, useState } from "react";
import { apiRoutes, http } from "@/api";
import { useToast } from "@/components/umerco/toast";
import type { NotificationItem } from "@/components/NotificationPopup";
import { useAuth } from "@/context/auth-context";

export const PORTAL_INBOUND_SCHEDULE_EVENT = "portal-inbound-schedule";

type NotificationsResponse = {
  notifications: Array<{
    id: string;
    title: string;
    body: string;
    time: string;
    unread?: boolean;
    href?: string;
    tone?: NotificationItem["tone"];
  }>;
  unreadCount?: number;
};

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  return new Date(iso).toLocaleDateString();
}

export function useNotifications(pollMs = 5000) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const seenIdsRef = useRef<Set<string> | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setUnreadCount(0);
      seenIdsRef.current = null;
      return;
    }

    try {
      const response = await http.get(apiRoutes.notifications.list, { skipAuthRedirect: true });
      if (!response.ok) {
        console.error("Notifications API returned", response.status);
        return;
      }
      const json = (await response.json()) as NotificationsResponse;

      const nextItems: NotificationItem[] = (json.notifications ?? []).map((item) => ({
        ...item,
        time: formatRelativeTime(item.time)
      }));

      if (seenIdsRef.current === null) {
        seenIdsRef.current = new Set(nextItems.map((item) => item.id));
      } else {
        const fresh = nextItems.filter((item) => !seenIdsRef.current?.has(item.id));
        for (const item of fresh) {
          toastRef.current.info(`${item.title}. ${item.body}`);
          window.dispatchEvent(new CustomEvent(PORTAL_INBOUND_SCHEDULE_EVENT));
        }
        for (const item of nextItems) seenIdsRef.current.add(item.id);
      }

      setItems(nextItems);
      setUnreadCount(json.unreadCount ?? nextItems.filter((item) => item.unread).length);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    seenIdsRef.current = null;
    void load();
    if (!isAuthenticated) return;
    const timer = window.setInterval(() => {
      void load();
    }, pollMs);
    const onFocus = () => {
      void load();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [isAuthenticated, load, pollMs]);

  const markAllRead = useCallback(async () => {
    try {
      await http.patch(apiRoutes.notifications.readAll);
    } catch {
      /* ignore */
    }
    await load();
  }, [load]);

  const markOneRead = useCallback(
    async (id: string) => {
      try {
        await http.patch(apiRoutes.notifications.readOne(id));
      } catch {
        /* ignore */
      }
      await load();
    },
    [load]
  );

  return { items, unreadCount, markAllRead, markOneRead, reload: load };
}
