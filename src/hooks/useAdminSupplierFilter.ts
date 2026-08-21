import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { listSuppliers, type ManagedSupplier } from "@/lib/master-portal-suppliers";

export function useAdminSupplierFilter() {
  const { user } = useAuth();
  const isPartnerAdmin = user?.actor === "partner_admin";
  const [supplierId, setSupplierId] = useState("");
  const [suppliers, setSuppliers] = useState<ManagedSupplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  useEffect(() => {
    if (!isPartnerAdmin) return;

    let cancelled = false;
    setSuppliersLoading(true);

    void listSuppliers()
      .then((items) => {
        if (cancelled) return;
        setSuppliers(items.filter((item) => item.status === "active"));
      })
      .catch(() => {
        if (!cancelled) setSuppliers([]);
      })
      .finally(() => {
        if (!cancelled) setSuppliersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isPartnerAdmin]);

  return {
    isPartnerAdmin,
    supplierId,
    setSupplierId,
    suppliers,
    suppliersLoading
  };
}
