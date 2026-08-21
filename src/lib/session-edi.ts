import { useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import type { PortalAuthUser } from "@/lib/auth";

export function ediCodesFromSession(user: PortalAuthUser | null | undefined): {
  supplierCode: string;
  tradingPartner: string;
} {
  return {
    supplierCode: user?.mutually_defined_zz?.trim() ?? "",
    tradingPartner: user?.company_mutually_defined_zz?.trim() ?? ""
  };
}

export function useSessionEdiCodes() {
  const { user } = useAuth();
  return useMemo(() => ediCodesFromSession(user), [user]);
}
