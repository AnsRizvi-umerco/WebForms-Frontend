import type { ManagedSupplier } from "@/lib/master-portal-suppliers";

export function SupplierScopeFilter({
  suppliers,
  value,
  onChange,
  disabled
}: {
  suppliers: ManagedSupplier[];
  value: string;
  onChange: (supplierId: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-medium text-umerco-muted">Supplier</span>
      <select
        className="umerco-input w-full min-w-[12rem] rounded-lg border border-umerco-border bg-white px-3 py-2 text-sm text-umerco-dark"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">All suppliers</option>
        {suppliers.map((supplier) => (
          <option key={supplier.id} value={supplier.id}>
            {supplier.full_name}
          </option>
        ))}
      </select>
    </label>
  );
}
