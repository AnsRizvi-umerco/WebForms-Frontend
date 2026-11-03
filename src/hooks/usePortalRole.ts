import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import type { PortalActor } from "@/lib/auth";
import {
  canAccessShippingLabels,
  isPartnerAdminUser,
  isSupplierUser,
  resolvePortalActor
} from "@/lib/portal-roles";
import { getPortalMe } from "@/lib/master-portal-suppliers";

export function usePortalRole() {
  const { user } = useAuth();
  const [resolvedActor, setResolvedActor] = useState<PortalActor | null>(() =>
    resolvePortalActor(user)
  );
  const [roleReady, setRoleReady] = useState(() => Boolean(resolvePortalActor(user)));

  useEffect(() => {
    if (!user) {
      setResolvedActor(null);
      setRoleReady(true);
      return;
    }

    setResolvedActor(resolvePortalActor(user));
    if (!resolvePortalActor(user)) {
      setRoleReady(false);
    }

    let cancelled = false;

    void getPortalMe()
      .then((me) => {
        if (cancelled) return;
        setResolvedActor(resolvePortalActor(user, me.actor));
      })
      .catch(() => {
        if (cancelled) return;
        setResolvedActor(resolvePortalActor(user));
      })
      .finally(() => {
        if (!cancelled) setRoleReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.actor]);

  const actor = resolvedActor ?? resolvePortalActor(user);

  return {
    actor,
    roleReady,
    isPartnerAdmin: isPartnerAdminUser(user, actor),
    isSupplier: isSupplierUser(user, actor),
    canAccessShippingLabels: canAccessShippingLabels(user, actor)
  };
}
