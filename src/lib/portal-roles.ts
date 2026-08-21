import type { PortalAuthUser, PortalActor } from "@/lib/auth";

export function resolvePortalActor(
  user: PortalAuthUser | null | undefined,
  actorOverride?: PortalActor | null
): PortalActor | null {
  if (actorOverride === "partner_admin" || actorOverride === "supplier") {
    return actorOverride;
  }
  if (user?.actor === "partner_admin" || user?.actor === "supplier") {
    return user.actor;
  }
  return null;
}

export function isPartnerAdminUser(
  user: PortalAuthUser | null | undefined,
  actorOverride?: PortalActor | null
): boolean {
  return resolvePortalActor(user, actorOverride) === "partner_admin";
}

export function isSupplierUser(
  user: PortalAuthUser | null | undefined,
  actorOverride?: PortalActor | null
): boolean {
  return resolvePortalActor(user, actorOverride) === "supplier";
}

export function canAccessShippingLabels(
  user: PortalAuthUser | null | undefined,
  actorOverride?: PortalActor | null
): boolean {
  return isSupplierUser(user, actorOverride);
}
