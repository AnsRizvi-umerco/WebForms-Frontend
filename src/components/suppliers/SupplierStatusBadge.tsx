import type { ManagedSupplier } from "@/lib/master-portal-suppliers";

export function supplierInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function SupplierStatusBadge({ status }: { status: ManagedSupplier["status"] }) {
  if (status === "active") {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        Active
      </span>
    );
  }
  if (status === "invited") {
    return (
      <span className="inline-flex rounded-full bg-umerco-beige px-2.5 py-1 text-xs font-medium text-umerco-dark">
        Invited
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
      Suspended
    </span>
  );
}
