import { useMemo, useState } from "react";
import { AlertTriangle, Download } from "lucide-react";
import { btnDark, btnOutline, card, tableBase, tableHeader, tdBase } from "@/components/umerco/styles";
import { UmercoSectionLabel } from "@/components/umerco/UmercoSectionLabel";

type EnvMode = "production" | "test";
type Direction = "IN" | "OUT";
type FaStatus = "Accepted" | "Rejected";
type DocStatus = "Accepted" | "Rejected" | "In process";

type ExceptionKind = "business" | "supplier" | "technical";

type ExceptionItem = {
  id: string;
  kind: ExceptionKind;
  title: string;
  meta: string;
  description: string;
  fix: string;
};

type TxRow = {
  id: string;
  dir: Direction;
  docType: string;
  date: string;
  refNo: string;
  shipFrom: string;
  fa: FaStatus;
  docStatus: DocStatus;
  counterparty: string;
};

const EXCEPTIONS: ExceptionItem[] = [
  {
    id: "ex-1",
    kind: "business",
    title: "ASN over-ships firm release",
    meta: "DESADV · ASN-20619 · ship-from 0342",
    description:
      "Line 10 shipped 1,250 ea against a firm cumulative-required of 1,200. SAP rejects over-shipment beyond ±2%.",
    fix: "Reduce ASN line 10 to 1,200 ea, or split the 50 overage to the next DELJIT, then resubmit."
  },
  {
    id: "ex-2",
    kind: "supplier",
    title: "Invoice references unknown PO line",
    meta: "INVOIC · INV-2826-3388 · ship-from 0342",
    description:
      "Line 30 cites PO 4500-88198 line 40, which does not exist (PO has lines 10–30).",
    fix: "Map line 30 to an existing PO line or remove it, then resend the invoice."
  }
];

const TRANSACTIONS: TxRow[] = [
  {
    id: "tx-1",
    dir: "IN",
    docType: "DELJIT",
    date: "22 Jun 09:02",
    refNo: "DJ-45019821",
    shipFrom: "0342",
    fa: "Accepted",
    docStatus: "Accepted",
    counterparty: "Lucid AMP-1"
  },
  {
    id: "tx-2",
    dir: "OUT",
    docType: "DESADV",
    date: "22 Jun 08:41",
    refNo: "ASN-20619",
    shipFrom: "0342",
    fa: "Rejected",
    docStatus: "Rejected",
    counterparty: "Lucid SAP"
  },
  {
    id: "tx-3",
    dir: "OUT",
    docType: "ORDRSP",
    date: "22 Jun 08:18",
    refNo: "OR-771204",
    shipFrom: "0342",
    fa: "Accepted",
    docStatus: "Accepted",
    counterparty: "Lucid Procure"
  },
  {
    id: "tx-4",
    dir: "IN",
    docType: "ORDERS",
    date: "21 Jun 16:55",
    refNo: "PO-450088198",
    shipFrom: "0342",
    fa: "Accepted",
    docStatus: "In process",
    counterparty: "Lucid Procure"
  },
  {
    id: "tx-5",
    dir: "OUT",
    docType: "INVOIC",
    date: "21 Jun 15:12",
    refNo: "INV-2826-3388",
    shipFrom: "0342",
    fa: "Rejected",
    docStatus: "Rejected",
    counterparty: "Lucid AP"
  },
  {
    id: "tx-6",
    dir: "IN",
    docType: "DELFOR",
    date: "21 Jun 09:00",
    refNo: "DF-120994",
    shipFrom: "0342",
    fa: "Accepted",
    docStatus: "Accepted",
    counterparty: "Lucid AMP-1"
  }
];

function kindBadge(kind: ExceptionKind) {
  if (kind === "business") {
    return {
      label: "Business validation",
      className: "bg-red-100 text-red-700"
    };
  }
  if (kind === "supplier") {
    return {
      label: "Supplier induced",
      className: "bg-amber-100 text-amber-800"
    };
  }
  return {
    label: "Technical",
    className: "bg-gray-100 text-gray-700"
  };
}

function faPill(status: FaStatus) {
  if (status === "Accepted") {
    return "bg-emerald-50 text-emerald-700";
  }
  return "bg-red-50 text-red-700";
}

function docStatusDot(status: DocStatus) {
  if (status === "Accepted") return "bg-emerald-500";
  if (status === "Rejected") return "bg-red-500";
  return "bg-umerco-primary";
}

export default function MessageHubPage() {
  const [env, setEnv] = useState<EnvMode>("production");
  const [filter, setFilter] = useState("");

  const counts = useMemo(() => {
    const business = EXCEPTIONS.filter((e) => e.kind === "business").length;
    const supplier = EXCEPTIONS.filter((e) => e.kind === "supplier").length;
    const technical = EXCEPTIONS.filter((e) => e.kind === "technical").length;
    return { business, supplier, technical };
  }, []);

  const rows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return TRANSACTIONS;
    return TRANSACTIONS.filter((row) =>
      [row.refNo, row.docType, row.shipFrom, row.counterparty, row.dir]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [filter]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <UmercoSectionLabel>Integrations</UmercoSectionLabel>
          <h2 className="text-2xl font-semibold text-umerco-dark">Message Hub</h2>
          <p className="mt-1 text-sm text-umerco-muted">
            All transactions sent &amp; received with Lucid
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full bg-[#eceff3] p-1">
              {(["production", "test"] as const).map((mode) => {
                const active = env === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setEnv(mode)}
                    className={`rounded-full px-4 py-1.5 text-sm capitalize transition-all ${
                      active
                        ? "bg-white font-semibold text-umerco-dark shadow-sm"
                        : "font-medium text-umerco-muted hover:text-umerco-dark"
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          <button type="button" className={`${btnOutline} gap-2 px-3`}>
            <Download size={16} strokeWidth={1.75} />
            Export
          </button>
        </div>
      </div>

      <section className={`${card} border-red-200 p-5`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600" strokeWidth={2} />
            <h3 className="text-base font-semibold text-umerco-dark">
              Exceptions — closed-loop from Lucid SAP
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-medium">
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-700">
              {counts.business} business
            </span>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">
              {counts.supplier} supplier-induced
            </span>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
              {counts.technical} technical
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {EXCEPTIONS.map((item) => {
            const badge = kindBadge(item.kind);
            return (
              <article
                key={item.id}
                className="rounded-lg border border-umerco-border bg-umerco-canvas/40 p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    <h4 className="mt-2 text-sm font-semibold text-umerco-dark">
                      {item.title}{" "}
                      <span className="font-normal text-umerco-muted">· {item.meta}</span>
                    </h4>
                    <p className="mt-1 text-sm text-umerco-muted">{item.description}</p>
                    <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                      <span className="font-semibold">Fix:</span> {item.fix}
                    </p>
                  </div>
                  <button type="button" className={`${btnDark} shrink-0 px-4`}>
                    Resolve &amp; resubmit
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={`${card} p-5`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold text-umerco-dark">Transaction log</h3>
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by ref, doc type, ship-from…"
            className="umerco-input w-full max-w-sm rounded-lg border border-umerco-border bg-white px-3 py-2 text-sm text-umerco-dark placeholder:text-umerco-muted"
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className={tableBase}>
            <thead>
              <tr>
                {[
                  "Dir",
                  "Doc type",
                  "Date",
                  "Ref no.",
                  "Ship-from",
                  "FA (997)",
                  "Doc status",
                  "Counterparty"
                ].map((heading) => (
                  <th key={heading} className={tableHeader}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-umerco-beige/60">
                  <td className={tdBase}>
                    <span className="font-mono text-xs font-semibold text-umerco-dark">
                      {row.dir}
                    </span>
                  </td>
                  <td className={tdBase}>
                    <span className="font-medium">{row.docType}</span>
                  </td>
                  <td className={`${tdBase} whitespace-nowrap text-umerco-muted`}>{row.date}</td>
                  <td className={`${tdBase} font-mono text-xs`}>{row.refNo}</td>
                  <td className={tdBase}>{row.shipFrom}</td>
                  <td className={tdBase}>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${faPill(row.fa)}`}
                    >
                      {row.fa}
                    </span>
                  </td>
                  <td className={tdBase}>
                    <span className="inline-flex items-center gap-2 text-sm">
                      <span className={`h-2 w-2 rounded-full ${docStatusDot(row.docStatus)}`} />
                      {row.docStatus}
                    </span>
                  </td>
                  <td className={tdBase}>{row.counterparty}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`${tdBase} py-8 text-center text-umerco-muted`}>
                    No transactions match this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
