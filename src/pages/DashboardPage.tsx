

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { btnPrimary, card } from "@/components/umerco/styles";
import { LoadingOverlay } from "@/components/umerco/LoadingOverlay";
import { UmercoSectionLabel } from "@/components/umerco/UmercoSectionLabel";
import { useToast } from "@/components/umerco/toast";
import { apiRoutes, http, withQuery } from "@/api";

const TransactionTrendChart = lazy(() =>
  import("@/components/dashboard/DashboardCharts").then((module) => ({
    default: module.TransactionTrendChart
  }))
);
const DocMixChart = lazy(() =>
  import("@/components/dashboard/DashboardCharts").then((module) => ({
    default: module.DocMixChart
  }))
);

function ChartFallback() {
  return (
    <div className="flex h-full min-h-[14rem] items-center justify-center rounded-lg border border-dashed border-umerco-border bg-umerco-canvas/40 text-sm text-umerco-muted">
      Loading chart…
    </div>
  );
}

type TrendPoint = {
  bucketKey: string;
  label: string;
  inbound: number;
  outbound: number;
};

type DocMixPoint = {
  name: string;
  value: number;
};

type DashboardPayload = {
  kpis: {
    inboundTransactionsMtd: number;
    outboundTransactionsMtd: number;
    activeTradingPartners: number;
    errorsExceptions: number;
    avgProcessingTimeMinutes: number;
  };
  trend: TrendPoint[];
  docMix: DocMixPoint[];
};

type RangeValue = "24h" | "7d" | "30d" | "12m" | "all" | "custom";
type GroupByValue = "hour" | "day" | "month" | "year";

type FetchArgs = {
  range: RangeValue;
  groupBy: GroupByValue;
  customFrom: string;
  customTo: string;
};

const dummyTrend: TrendPoint[] = [
  { bucketKey: "2025-10", label: "Oct", inbound: 24, outbound: 17 },
  { bucketKey: "2025-11", label: "Nov", inbound: 30, outbound: 22 },
  { bucketKey: "2025-12", label: "Dec", inbound: 27, outbound: 26 },
  { bucketKey: "2026-01", label: "Jan", inbound: 35, outbound: 29 },
  { bucketKey: "2026-02", label: "Feb", inbound: 42, outbound: 31 },
  { bucketKey: "2026-03", label: "Mar", inbound: 38, outbound: 34 },
  { bucketKey: "2026-04", label: "Apr", inbound: 45, outbound: 36 }
];
const dummyDocMix: DocMixPoint[] = [
  { name: "DESADV", value: 45 },
  { name: "INVOIC", value: 30 },
  { name: "ORDRSP", value: 15 },
  { name: "APERAK", value: 10 }
];
const dummyKpis = {
  inboundTransactionsMtd: 12,
  outboundTransactionsMtd: 28,
  activeTradingPartners: 0,
  errorsExceptions: 0,
  avgProcessingTimeMinutes: 0
};

const INITIAL_FETCH: FetchArgs = {
  range: "30d",
  groupBy: "day",
  customFrom: "",
  customTo: ""
};

function readBooleanEnv(value: string | undefined): boolean {
  return ["1", "true", "yes", "on"].includes((value || "").trim().toLowerCase());
}

function defaultGroupBy(range: RangeValue): GroupByValue {
  if (range === "24h") return "hour";
  if (range === "all") return "year";
  if (range === "12m") return "month";
  return "day";
}

function allowedGroupBy(range: RangeValue): GroupByValue[] {
  if (range === "24h") return ["hour"];
  if (range === "all") return ["year", "month"];
  if (range === "12m") return ["month", "year"];
  return ["day", "month"];
}

function coerceGroupBy(range: RangeValue, groupBy: GroupByValue): GroupByValue {
  const allowed = allowedGroupBy(range);
  return allowed.includes(groupBy) ? groupBy : defaultGroupBy(range);
}

function serializeAppliedKey(args: FetchArgs): string {
  return `${args.range}|${args.groupBy}|${args.customFrom}|${args.customTo}`;
}

export default function DashboardPage() {
  const useDummyData = readBooleanEnv(import.meta.env.VITE_USE_DUMMY_DASHBOARD_DATA);
  const toast = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingRange, setPendingRange] = useState<RangeValue>(INITIAL_FETCH.range);
  const [pendingGroupBy, setPendingGroupBy] = useState<GroupByValue>(INITIAL_FETCH.groupBy);
  const [pendingCustomFrom, setPendingCustomFrom] = useState(INITIAL_FETCH.customFrom);
  const [pendingCustomTo, setPendingCustomTo] = useState(INITIAL_FETCH.customTo);
  const [lastAppliedKey, setLastAppliedKey] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const onPendingRangeChange = (next: RangeValue) => {
    setPendingRange(next);
    const allowed = allowedGroupBy(next);
    setPendingGroupBy((current) => (allowed.includes(current) ? current : defaultGroupBy(next)));
  };

  const runFetch = useCallback(async (args: FetchArgs, signal: AbortSignal) => {
    const groupBy = coerceGroupBy(args.range, args.groupBy);
    if (args.range === "custom" && (!args.customFrom || !args.customTo)) {
      toast.warning("Choose both From and To dates for a custom range.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        range: args.range,
        groupBy
      });
      if (args.range === "custom") {
        params.set("from", args.customFrom);
        params.set("to", args.customTo);
      }
      const response = await http.get(withQuery(apiRoutes.dashboard, params), { signal });
      if (!response.ok) {
        throw new Error(`Dashboard API returned ${response.status}`);
      }
      const data = (await response.json()) as DashboardPayload;
      if (signal.aborted) return;
      setDashboardData(data);
      setLastAppliedKey(serializeAppliedKey({ ...args, groupBy }));
    } catch (error) {
      if (signal.aborted || (error instanceof DOMException && error.name === "AbortError")) return;
      toast.error(error instanceof Error ? error.message : "Failed to load dashboard data");
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [toast]);

  const startFetch = useCallback(
    (args: FetchArgs) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      void runFetch(args, ac.signal);
    },
    [runFetch]
  );

  useEffect(() => {
    if (useDummyData) return;
    startFetch(INITIAL_FETCH);
    return () => {
      abortRef.current?.abort();
    };
  }, [useDummyData, startFetch]);

  const pendingKey = useMemo(
    () =>
      serializeAppliedKey({
        range: pendingRange,
        groupBy: coerceGroupBy(pendingRange, pendingGroupBy),
        customFrom: pendingCustomFrom,
        customTo: pendingCustomTo
      }),
    [pendingCustomFrom, pendingCustomTo, pendingGroupBy, pendingRange]
  );

  const customIncomplete = pendingRange === "custom" && (!pendingCustomFrom || !pendingCustomTo);
  const applyDisabled =
    useDummyData ||
    loading ||
    customIncomplete ||
    (lastAppliedKey !== null && pendingKey === lastAppliedKey && dashboardData !== null);

  const onApplyFilters = () => {
    if (useDummyData) return;
    startFetch({
      range: pendingRange,
      groupBy: coerceGroupBy(pendingRange, pendingGroupBy),
      customFrom: pendingCustomFrom,
      customTo: pendingCustomTo
    });
  };

  const kpis = useMemo(() => {
    if (useDummyData) return dummyKpis;
    return dashboardData?.kpis ?? dummyKpis;
  }, [dashboardData, useDummyData]);

  const trend = useMemo(() => {
    if (useDummyData) return dummyTrend;
    if (!dashboardData?.trend?.length) return [];
    return dashboardData.trend;
  }, [dashboardData, useDummyData]);

  const docMix = useMemo(() => {
    if (useDummyData) return dummyDocMix;
    if (!dashboardData?.docMix?.length) return [];
    return dashboardData.docMix;
  }, [dashboardData, useDummyData]);

  const showLoadingOverlay = !useDummyData && loading;

  return (
    <>
      <UmercoSectionLabel>Dashboard</UmercoSectionLabel>
      <h2 className="mb-4 text-xl font-semibold text-umerco-dark">Dashboard</h2>
      <div className={`mb-4 ${card} p-3`}>
        <div className="flex flex-wrap items-end gap-3">
          <button
            type="button"
            className={`shrink-0 ${btnPrimary} px-4`}
            disabled={applyDisabled}
            onClick={onApplyFilters}
          >
            {loading ? "Loading…" : "Apply filters"}
          </button>
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4">
            <label className="text-sm">
              <span className="mb-1 block umerco-section-label">Range</span>
              <select
                className="umerco-input px-2 py-2"
                value={pendingRange}
                onChange={(e) => onPendingRangeChange(e.target.value as RangeValue)}
              >
                <option value="24h">24H</option>
                <option value="7d">7D</option>
                <option value="30d">30D</option>
                <option value="12m">12M</option>
                <option value="custom">Custom</option>
                <option value="all">All</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block umerco-section-label">Group By</span>
              <select
                className="umerco-input px-2 py-2"
                value={pendingGroupBy}
                onChange={(e) => setPendingGroupBy(e.target.value as GroupByValue)}
              >
                {allowedGroupBy(pendingRange).map((option) => (
                  <option key={option} value={option}>
                    {option.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            {pendingRange === "custom" && (
              <>
                <label className="text-sm">
                  <span className="mb-1 block umerco-section-label">From</span>
                  <input
                    className="umerco-input px-2 py-2"
                    type="date"
                    value={pendingCustomFrom}
                    onChange={(e) => setPendingCustomFrom(e.target.value)}
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block umerco-section-label">To</span>
                  <input
                    className="umerco-input px-2 py-2"
                    type="date"
                    value={pendingCustomTo}
                    onChange={(e) => setPendingCustomTo(e.target.value)}
                  />
                </label>
              </>
            )}
          </div>
        </div>
        {customIncomplete && (
          <p className="mt-2 text-xs text-umerco-muted">Select both dates for a custom range before applying.</p>
        )}
      </div>

      <div className="relative">
        {showLoadingOverlay && <LoadingOverlay message="Loading dashboard…" />}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            {
              label: "Inbound MTD",
              subtitle: "DELJIT receipts",
              value: String(kpis.inboundTransactionsMtd)
            },
            {
              label: "Outbound MTD",
              subtitle: "Portal submissions",
              value: String(kpis.outboundTransactionsMtd)
            },
            { label: "Active Trading Partners", subtitle: null, value: String(kpis.activeTradingPartners) },
            { label: "Errors/Exceptions", subtitle: null, value: String(kpis.errorsExceptions) },
            {
              label: "Avg Processing Time",
              subtitle: null,
              value: `${kpis.avgProcessingTimeMinutes} min`
            }
          ].map((item) => (
            <div className={`${card} p-4`} key={item.label}>
              <p className="umerco-section-label">{item.label}</p>
              {item.subtitle ? (
                <p className="mt-0.5 text-xs text-umerco-muted">{item.subtitle}</p>
              ) : null}
              <p className="mt-2 text-2xl font-semibold text-umerco-dark">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className={`h-72 ${card} flex flex-col p-3`}>
            <UmercoSectionLabel>Transaction trend</UmercoSectionLabel>
            <div className="min-h-0 flex-1 pt-2">
              <Suspense fallback={<ChartFallback />}>
                <TransactionTrendChart data={trend} />
              </Suspense>
            </div>
          </div>
          <div className={`h-72 ${card} flex flex-col p-3`}>
            <UmercoSectionLabel>Outbound document mix</UmercoSectionLabel>
            <div className="min-h-0 flex-1 pt-2">
              <Suspense fallback={<ChartFallback />}>
                <DocMixChart data={docMix} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
