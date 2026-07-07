

import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  FileCheck,
  Package,
  Receipt,
  Search,
  SlidersHorizontal,
  X
} from "lucide-react";
import { apiRoutes, http, withQuery } from "@/api";
import {
  btnOutline,
  btnPrimary,
  btnSecondary,
  statusPill,
  tableBase,
  tableHeader,
  tableRowClass,
  tableWrap,
  tdBase,
  trHover
} from "@/components/umerco/styles";
import { UmercoAlert } from "@/components/umerco/UmercoAlert";
import { LoadingBlock } from "@/components/umerco/LoadingBlock";
import { Pagination } from "@/components/umerco/Pagination";
import { UmercoSectionLabel } from "@/components/umerco/UmercoSectionLabel";
import { useToast } from "@/components/umerco/toast";
import type { DeljitMessage } from "@/lib/schemas/deljit";

type DateRangeValue = "24h" | "7d" | "30d" | "12m" | "all" | "custom";

type ScheduleDateBasis = "period" | "received" | "release";

type ScheduleSummary = {
  id: string;
  deljit_ref: string;
  period_start: string;
  period_end: string;
  status: string;
  received_at?: string;
  release_date?: string | null;
};

type ScheduleListResponse = {
  schedules: ScheduleSummary[];
  error?: string;
};

type FilterArgs = {
  basis: ScheduleDateBasis;
  range: DateRangeValue;
  customFrom: string;
  customTo: string;
  deljitRef: string;
};

const INITIAL_FILTERS: FilterArgs = {
  basis: "period",
  range: "all",
  customFrom: "",
  customTo: "",
  deljitRef: ""
};

function serializeFilterKey(args: FilterArgs): string {
  return `${args.basis}|${args.range}|${args.customFrom}|${args.customTo}|${args.deljitRef}`;
}

type ScheduleLineRow = {
  id: string;
  part_no: string;
  description: string | null;
  qty_required: number;
  uom: string;
  deliver_by: string;
  facility: string;
};

type ScheduleDetailResponse = {
  schedule: {
    id: string;
    deljit_ref: string;
    release_date: string | null;
    period_start: string;
    period_end: string;
    status: string;
    received_at: string;
  } | null;
  lines: ScheduleLineRow[];
  message: DeljitMessage | null;
  canonical_parse_error: string | null;
  canonical_json_raw: unknown;
  lines_consistent_with_message: boolean | null;
  error?: string;
};

function formatInboundDate(value: string) {
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  }
  return value;
}

function statusLabel(status: string) {
  if (status === "completed") return "Completed";
  if (status === "acknowledged") return "Acknowledged";
  if (status === "pending") return "Pending";
  return status;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-semibold tracking-tight text-umerco-dark">{children}</h4>;
}

function SectionSubtitle({ children }: { children: React.ReactNode }) {
  return <p className="mt-0.5 text-sm text-umerco-muted">{children}</p>;
}

function OverviewField({
  label,
  children,
  mono
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-umerco-muted">{label}</dt>
      <dd className={`mt-0.5 break-words text-sm text-umerco-dark ${mono ? "font-mono" : ""}`}>{children}</dd>
    </div>
  );
}

function formatDeliverByDisplay(value: string) {
  const formatted = formatInboundDate(value);
  return formatted === value ? value : `${value} (${formatted})`;
}

function formatInboundDateDisplay(value: string | null | undefined) {
  if (!value) return "Not specified";
  const formatted = formatInboundDate(value);
  return formatted === value ? value : `${value} (${formatted})`;
}

const DETAIL_CLOSE_MS = 300;
const DEFAULT_PAGE_SIZE = 5;
const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;

type OpenPanel = "filter" | "search" | null;

function formatPeriod(start: string, end: string) {
  const format = (value: string) => {
    const normalized = formatInboundDate(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      return new Date(`${normalized}T00:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }
    return normalized;
  };

  const startLabel = format(start);
  const endLabel = format(end);
  return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
}

function panelToggleClass(open: boolean, active: boolean) {
  const base = "inline-flex items-center gap-2";
  if (open) return `${base} ${btnPrimary}`;
  if (active) return `${base} ${btnSecondary} ring-2 ring-umerco-primary/20`;
  return `${base} ${btnSecondary}`;
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <ChevronDown
      aria-hidden
      className={`h-4 w-4 shrink-0 text-umerco-muted transition-transform duration-300 ease-out ${
        expanded ? "rotate-180" : ""
      }`}
      strokeWidth={1.75}
    />
  );
}

export function SchedulesBoard() {
  const toast = useToast();
  const pathname = useLocation().pathname;
  const [searchParams] = useSearchParams();
  const [activeId, setActiveId] = useState<string | null>(() => searchParams.get("schedule"));

  const [schedules, setSchedules] = useState<ScheduleSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listFetchError, setListFetchError] = useState<string | null>(null);
  const [pendingBasis, setPendingBasis] = useState<ScheduleDateBasis>(INITIAL_FILTERS.basis);
  const [pendingRange, setPendingRange] = useState<DateRangeValue>(INITIAL_FILTERS.range);
  const [pendingCustomFrom, setPendingCustomFrom] = useState(INITIAL_FILTERS.customFrom);
  const [pendingCustomTo, setPendingCustomTo] = useState(INITIAL_FILTERS.customTo);
  const [pendingDeljitRef, setPendingDeljitRef] = useState(INITIAL_FILTERS.deljitRef);
  const [lastAppliedKey, setLastAppliedKey] = useState<string | null>(null);
  const [lastAppliedDeljitRef, setLastAppliedDeljitRef] = useState("");
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const listTopRef = useRef<HTMLDivElement>(null);
  const listAbortRef = useRef<AbortController | null>(null);
  const deljitSearchInputRef = useRef<HTMLInputElement>(null);

  const [detail, setDetail] = useState<ScheduleDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailFetchError, setDetailFetchError] = useState<string | null>(null);
  const [rawExpanded, setRawExpanded] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);
  const detailAnchorRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runListFetch = useCallback(async (args: FilterArgs, signal: AbortSignal) => {
    if (args.range === "custom" && (!args.customFrom || !args.customTo)) {
      setListFetchError("Choose both From and To dates for a custom range.");
      return;
    }

    setListFetchError(null);
    setListLoading(true);
    try {
      const params = new URLSearchParams({
        basis: args.basis,
        range: args.range
      });
      if (args.range === "custom") {
        params.set("from", args.customFrom);
        params.set("to", args.customTo);
      }
      if (args.deljitRef) {
        params.set("deljitRef", args.deljitRef);
      }
      const response = await http.get(withQuery(apiRoutes.schedules.list, params), { signal });
      const json = (await response.json()) as ScheduleListResponse;
      if (signal.aborted) return;
      if (!response.ok) {
        throw new Error(json.error ?? `Schedules API returned ${response.status}`);
      }
      setSchedules(json.schedules ?? []);
      setLastAppliedKey(serializeFilterKey(args));
      setLastAppliedDeljitRef(args.deljitRef);
    } catch (error) {
      if (signal.aborted || (error instanceof DOMException && error.name === "AbortError")) return;
      const message = error instanceof Error ? error.message : "Failed to load schedules";
      setListFetchError(message);
      toast.error(message);
    } finally {
      if (!signal.aborted) setListLoading(false);
    }
  }, [toast]);

  const startListFetch = useCallback(
    (args: FilterArgs) => {
      listAbortRef.current?.abort();
      const ac = new AbortController();
      listAbortRef.current = ac;
      void runListFetch(args, ac.signal);
    },
    [runListFetch]
  );

  useEffect(() => {
    startListFetch(INITIAL_FILTERS);
    return () => {
      listAbortRef.current?.abort();
    };
  }, [startListFetch]);

  const pendingFilterArgs = useMemo(
    (): FilterArgs => ({
      basis: pendingBasis,
      range: pendingRange,
      customFrom: pendingCustomFrom,
      customTo: pendingCustomTo,
      deljitRef: pendingDeljitRef.trim()
    }),
    [pendingBasis, pendingCustomFrom, pendingCustomTo, pendingDeljitRef, pendingRange]
  );

  const pendingKey = useMemo(() => serializeFilterKey(pendingFilterArgs), [pendingFilterArgs]);

  const customIncomplete = pendingRange === "custom" && (!pendingCustomFrom || !pendingCustomTo);
  const applyDisabled =
    listLoading ||
    customIncomplete ||
    (lastAppliedKey !== null && pendingKey === lastAppliedKey && !listFetchError);
  const searchDisabled = listLoading || customIncomplete || !pendingDeljitRef.trim();

  const filtersActive =
    lastAppliedKey !== null &&
    lastAppliedKey !== serializeFilterKey({ ...INITIAL_FILTERS, deljitRef: lastAppliedDeljitRef });
  const searchActive = lastAppliedDeljitRef.length > 0;
  const searchClearVisible = searchActive || pendingDeljitRef.trim().length > 0;
  const showFilterPanel = openPanel === "filter" || filtersActive;
  const showSearchPanel = openPanel === "search" || searchActive;

  const onApplyFilters = () => {
    startListFetch(pendingFilterArgs);
    setOpenPanel("filter");
  };

  const onSearchDeljit = () => {
    if (!pendingDeljitRef.trim()) return;
    startListFetch(pendingFilterArgs);
    setOpenPanel("search");
  };

  const onClearFilters = () => {
    setPendingBasis(INITIAL_FILTERS.basis);
    setPendingRange(INITIAL_FILTERS.range);
    setPendingCustomFrom(INITIAL_FILTERS.customFrom);
    setPendingCustomTo(INITIAL_FILTERS.customTo);
    startListFetch({
      ...INITIAL_FILTERS,
      deljitRef: pendingDeljitRef.trim()
    });
  };

  const onClearSearch = () => {
    const hadAppliedSearch = searchActive;
    setPendingDeljitRef("");
    if (hadAppliedSearch) {
      startListFetch({
        basis: pendingBasis,
        range: pendingRange,
        customFrom: pendingCustomFrom,
        customTo: pendingCustomTo,
        deljitRef: ""
      });
    }
  };

  const toggleFiltersPanel = () => {
    if (filtersActive) {
      setOpenPanel("filter");
      return;
    }
    setOpenPanel((current) => (current === "filter" ? null : "filter"));
  };

  const toggleSearchPanel = () => {
    if (searchActive) {
      setOpenPanel("search");
      return;
    }
    setOpenPanel((current) => (current === "search" ? null : "search"));
  };

  useEffect(() => {
    if (openPanel === "search") {
      deljitSearchInputRef.current?.focus();
    }
  }, [openPanel]);

  useEffect(() => {
    setPage(1);
  }, [lastAppliedKey]);

  useEffect(() => {
    if (!activeId || schedules.length === 0) return;
    const index = schedules.findIndex((schedule) => schedule.id === activeId);
    if (index >= 0) {
      setPage(Math.floor(index / pageSize) + 1);
    }
  }, [activeId, schedules, pageSize]);

  const totalPages = Math.max(1, Math.ceil(schedules.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedSchedules = useMemo(() => {
    const start = (page - 1) * pageSize;
    return schedules.slice(start, start + pageSize);
  }, [page, pageSize, schedules]);

  const handlePageChange = (nextPage: number) => {
    const start = (nextPage - 1) * pageSize;
    const pageItems = schedules.slice(start, start + pageSize);
    if (activeId && !pageItems.some((schedule) => schedule.id === activeId)) {
      cancelCloseTimer();
      setActiveId(null);
      setClosingId(null);
      updateScheduleUrl(null, "replace");
    }
    setPage(nextPage);
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const updateScheduleUrl = useCallback(
    (id: string | null, mode: "push" | "replace") => {
      const params = new URLSearchParams(window.location.search);
      if (id) params.set("schedule", id);
      else params.delete("schedule");
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (mode === "push") window.history.pushState(null, "", url);
      else window.history.replaceState(null, "", url);
    },
    [pathname]
  );

  const cancelCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closeSchedule = useCallback(() => {
    if (!activeId) return;
    cancelCloseTimer();
    const idToClose = activeId;
    setClosingId(idToClose);
    closeTimerRef.current = setTimeout(() => {
      setActiveId(null);
      updateScheduleUrl(null, "replace");
      closeTimerRef.current = null;
    }, DETAIL_CLOSE_MS);
  }, [activeId, cancelCloseTimer, updateScheduleUrl]);

  const openSchedule = useCallback(
    (id: string) => {
      cancelCloseTimer();
      setClosingId(null);
      setActiveId(id);
      updateScheduleUrl(id, "push");
    },
    [cancelCloseTimer, updateScheduleUrl]
  );

  useEffect(() => () => cancelCloseTimer(), [cancelCloseTimer]);

  useEffect(() => {
    if (!activeId) setClosingId(null);
  }, [activeId]);

  useEffect(() => {
    const onPopState = () => {
      cancelCloseTimer();
      const id = new URLSearchParams(window.location.search).get("schedule");
      setActiveId(id);
      setClosingId(null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [cancelCloseTimer]);

  useEffect(() => {
    if (!activeId) {
      setDetail(null);
      setDetailFetchError(null);
      setDetailLoading(false);
      setRawExpanded(false);
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    setDetailFetchError(null);
    setDetail(null);

    http.get(apiRoutes.schedules.byId(activeId))
      .then(async (res) => {
        const json = (await res.json()) as ScheduleDetailResponse;
        if (cancelled) return;
        if (!res.ok || !json.schedule) {
          const message = json.error ?? "Could not load this schedule.";
          setDetailFetchError(message);
          toast.error(message);
          setDetail(null);
          return;
        }
        setDetail(json);
      })
      .catch(() => {
        if (!cancelled) {
          const message = "Network error while loading schedule.";
          setDetailFetchError(message);
          toast.error(message);
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeId, toast]);

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSchedule();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, closeSchedule]);

  useEffect(() => {
    if (!activeId || closingId) return;
    const id = window.requestAnimationFrame(() => {
      detailAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [activeId, closingId]);

  const toggleSchedule = (id: string) => {
    if (activeId === id) {
      if (closingId === id) return;
      closeSchedule();
      return;
    }
    openSchedule(id);
  };

  const scheduleStats = useMemo(() => {
    const pending = schedules.filter((schedule) => schedule.status === "pending").length;
    const acknowledged = schedules.filter((schedule) => schedule.status === "acknowledged").length;
    const completed = schedules.filter((schedule) => schedule.status === "completed").length;
    return { total: schedules.length, pending, acknowledged, completed };
  }, [schedules]);

  if (listLoading) {
    return (
      <div className="flex min-h-[calc(100dvh-9.5rem)] items-center justify-center">
        <LoadingBlock message="Loading schedules…" size="md" />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-5 pb-2 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <UmercoSectionLabel>Delivery Schedules</UmercoSectionLabel>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-umerco-dark">Delivery Schedules</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-umerco-muted">
            Review inbound DELJIT releases, acknowledge schedules, and create ASNs or invoices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={panelToggleClass(showFilterPanel, filtersActive)}
            aria-expanded={showFilterPanel}
            aria-controls="schedules-filter-panel"
            onClick={toggleFiltersPanel}
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
            Filter
          </button>
          <button
            type="button"
            className={panelToggleClass(showSearchPanel, searchActive)}
            aria-expanded={showSearchPanel}
            aria-controls="schedules-search-panel"
            onClick={toggleSearchPanel}
          >
            <Search className="h-4 w-4" strokeWidth={1.75} />
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={scheduleStats.total} />
        <StatCard label="Pending" value={scheduleStats.pending} tone="pending" />
        <StatCard label="Acknowledged" value={scheduleStats.acknowledged} tone="acknowledged" />
        <StatCard label="Completed" value={scheduleStats.completed} tone="completed" />
      </div>

      {listFetchError ? (
        <p className="text-xs text-umerco-muted">{listFetchError}</p>
      ) : null}

      {showFilterPanel && (
        <div id="schedules-filter-panel" className="schedule-panel p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-umerco-dark">Date filters</p>
              <p className="mt-0.5 text-xs text-umerco-muted">Narrow schedules by period, received, or release date.</p>
            </div>
            {filtersActive && (
              <button
                type="button"
                className={`${btnSecondary} gap-1.5 px-2.5 py-1.5 text-xs`}
                aria-label="Clear date filters"
                onClick={onClearFilters}
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm">
                <span className="mb-1 block umerco-section-label">Date basis</span>
                <select
                  className="umerco-input px-2 py-2"
                  value={pendingBasis}
                  onChange={(e) => setPendingBasis(e.target.value as ScheduleDateBasis)}
                >
                  <option value="period">Schedule period</option>
                  <option value="received">Received date</option>
                  <option value="release">Release date</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block umerco-section-label">Range</span>
                <select
                  className="umerco-input px-2 py-2"
                  value={pendingRange}
                  onChange={(e) => setPendingRange(e.target.value as DateRangeValue)}
                >
                  <option value="24h">24H</option>
                  <option value="7d">7D</option>
                  <option value="30d">30D</option>
                  <option value="12m">12M</option>
                  <option value="custom">Custom</option>
                  <option value="all">All</option>
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
            <button
              type="button"
              className={`shrink-0 ${btnPrimary} px-4`}
              disabled={applyDisabled}
              onClick={onApplyFilters}
            >
              Apply filters
            </button>
          </div>
          {customIncomplete && (
            <p className="mt-2 text-xs text-umerco-muted">Select both dates for a custom range before applying.</p>
          )}
        </div>
      )}

      {showSearchPanel && (
        <div id="schedules-search-panel" className="schedule-panel p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-umerco-dark">DELJIT search</p>
              <p className="mt-0.5 text-xs text-umerco-muted">Find a schedule by its DELJIT reference number.</p>
            </div>
            {searchClearVisible && (
              <button
                type="button"
                className={`${btnSecondary} gap-1.5 px-2.5 py-1.5 text-xs`}
                aria-label="Clear DELJIT search"
                onClick={onClearSearch}
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="min-w-[12rem] flex-1 text-sm">
              <span className="mb-1 block umerco-section-label">DELJIT reference</span>
              <input
                ref={deljitSearchInputRef}
                className="umerco-input w-full px-2 py-2 font-mono"
                type="text"
                placeholder="e.g. DELJIT-12345"
                value={pendingDeljitRef}
                onChange={(e) => setPendingDeljitRef(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && pendingDeljitRef.trim() && !searchDisabled) {
                    onSearchDeljit();
                  }
                }}
              />
            </label>
            <button
              type="button"
              className={`shrink-0 ${btnPrimary} px-4`}
              disabled={searchDisabled}
              onClick={onSearchDeljit}
            >
              Search
            </button>
          </div>
        </div>
      )}

      <div ref={listTopRef}>
        {schedules.length === 0 ? (
          <div className="schedule-panel flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-umerco-primary-soft text-umerco-primary">
              <CalendarClock className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <p className="mt-4 text-sm font-medium text-umerco-dark">No schedules found</p>
            <p className="mt-1 max-w-sm text-sm text-umerco-muted">
              {lastAppliedDeljitRef
                ? "No schedules match this DELJIT reference. Try a different reference or clear the search."
                : "No schedules match these filters. Adjust your date range or clear filters to see more results."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Pagination
              page={page}
              pageSize={pageSize}
              totalItems={schedules.length}
              pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              itemLabel="schedules"
            />

            {paginatedSchedules.map((schedule) => {
        const isOpen = activeId === schedule.id;
        const isClosing = closingId === schedule.id;
        const expanded = isOpen && !isClosing;
        const panelOpen = isOpen && !isClosing;
        const showPanel = isOpen;
        const detailPanelId = `schedule-detail-${schedule.id}`;

        return (
          <div
            key={schedule.id}
            className={`schedule-card overflow-hidden ${expanded ? "schedule-card-expanded" : ""}`}
          >
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={detailPanelId}
              onClick={() => toggleSchedule(schedule.id)}
              className="w-full px-5 py-4 text-left transition-colors hover:bg-umerco-canvas/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-umerco-primary-soft text-umerco-primary">
                    <CalendarClock className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-sm font-semibold text-umerco-dark">{schedule.deljit_ref}</p>
                      <span className={statusPill(schedule.status)}>{statusLabel(schedule.status)}</span>
                    </div>
                    <p className="mt-1 text-sm text-umerco-muted">
                      {formatPeriod(schedule.period_start, schedule.period_end)}
                    </p>
                    <p className="mt-1 text-xs font-medium text-umerco-primary">
                      {expanded ? "Hide schedule details" : "View schedule details"}
                    </p>
                  </div>
                </div>
                <ChevronIcon expanded={expanded} />
              </div>
            </button>

            <div
              className="grid grid-cols-1 gap-2 border-t border-umerco-border/70 px-5 py-4 sm:grid-cols-2 xl:grid-cols-4"
              onClick={(e) => e.stopPropagation()}
            >
              <ScheduleActionLink
                icon={<CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />}
                label="Acknowledge Schedule"
                to={`/submit/scheduleack?schedule=${schedule.id}&deljitRef=${encodeURIComponent(schedule.deljit_ref)}`}
                variant="secondary"
              />
              <ScheduleActionLink
                icon={<FileCheck className="h-4 w-4" strokeWidth={1.75} />}
                label="PO Acknowledgement"
                to={`/submit/poack?schedule=${schedule.id}`}
                variant="secondary"
              />
              <ScheduleActionLink
                icon={<Package className="h-4 w-4" strokeWidth={1.75} />}
                label="Create ASN"
                to={`/submit/asn?schedule=${schedule.id}`}
                variant="primary"
              />
              <ScheduleActionLink
                icon={<Receipt className="h-4 w-4" strokeWidth={1.75} />}
                label="Create Invoice"
                to={`/submit/invoice?schedule=${schedule.id}`}
                variant="outline"
              />
            </div>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                panelOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                {showPanel ? (
                  <ScheduleDetailPanel
                    id={detailPanelId}
                    detailRef={detailAnchorRef}
                    loading={detailLoading}
                    fetchError={detailFetchError}
                    detail={detail}
                    rawExpanded={rawExpanded}
                    setRawExpanded={setRawExpanded}
                    onClose={closeSchedule}
                  />
                ) : null}
              </div>
            </div>
          </div>
        );
      })}

            <Pagination
              page={page}
              pageSize={pageSize}
              totalItems={schedules.length}
              pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              itemLabel="schedules"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ScheduleDetailPanel({
  id,
  detailRef,
  loading,
  fetchError,
  detail,
  rawExpanded,
  setRawExpanded,
  onClose
}: {
  id: string;
  detailRef: React.Ref<HTMLDivElement>;
  loading: boolean;
  fetchError: string | null;
  detail: ScheduleDetailResponse | null;
  rawExpanded: boolean;
  setRawExpanded: (v: boolean) => void;
  onClose: () => void;
}) {
  return (
    <div
      ref={detailRef}
      id={id}
      role="region"
      aria-label="Schedule order details"
      className="scroll-mt-24 animate-detail-in border-t border-umerco-border/70 bg-white/80"
    >
      <div className="flex items-center justify-between gap-3 border-b border-umerco-border/70 px-5 py-3">
        <div>
          <p className="text-sm font-medium text-umerco-dark">Schedule details</p>
          <p className="mt-0.5 text-xs text-umerco-muted">
            {loading
              ? "Loading schedule details…"
              : detail?.schedule
                ? `Received ${new Date(detail.schedule.received_at).toLocaleString()}`
                : "Order lines and technical payload"}
          </p>
        </div>
        <button type="button" className={`${btnSecondary} gap-1.5 px-3 py-1.5 text-xs`} onClick={onClose}>
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
          Close
        </button>
      </div>

      <div className="px-5 py-4">
        {loading ? (
          <LoadingBlock message="Loading schedule details…" />
        ) : fetchError ? (
          <p className="text-sm text-umerco-muted">{fetchError}</p>
        ) : detail?.schedule ? (
          <DeljitDetailBody detail={detail} rawExpanded={rawExpanded} setRawExpanded={setRawExpanded} />
        ) : null}
      </div>
    </div>
  );
}

function DeljitDetailBody({
  detail,
  rawExpanded,
  setRawExpanded
}: {
  detail: ScheduleDetailResponse;
  rawExpanded: boolean;
  setRawExpanded: (v: boolean) => void;
}) {
  const { schedule, lines, message, canonical_parse_error, lines_consistent_with_message } = detail;
  if (!schedule) return null;

  const showSplitOrder = message !== null && lines_consistent_with_message === false;
  const showSingleOrderFromMessage = message !== null && lines_consistent_with_message !== false;
  const showSystemOrderOnly = !message && lines.length > 0;

  return (
    <div className="space-y-4">
      <section>
        <SectionTitle>Overview</SectionTitle>
        <SectionSubtitle>Portal record, trading partners, and schedule window.</SectionSubtitle>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3 lg:grid-cols-4">
          <OverviewField label="Reference" mono>
            {schedule.deljit_ref}
          </OverviewField>
          <OverviewField label="Period">
            {schedule.period_start} to {schedule.period_end}
          </OverviewField>
          {schedule.release_date ? (
            <OverviewField label="Release date">{schedule.release_date}</OverviewField>
          ) : null}
          {message ? (
            <>
              <OverviewField label="Document" mono>
                {message.messageType}
              </OverviewField>
              <OverviewField label="Supplier" mono>
                {message.supplierCode}
              </OverviewField>
              <OverviewField label="Partner" mono>
                {message.tradingPartner}
              </OverviewField>
              <OverviewField label="Release (inbound)" mono>
                {formatInboundDateDisplay(message.payload.releaseDate)}
              </OverviewField>
              <OverviewField label="Period start (inbound)" mono>
                {formatInboundDateDisplay(message.payload.periodStart)}
              </OverviewField>
              <OverviewField label="Period end (inbound)" mono>
                {formatInboundDateDisplay(message.payload.periodEnd)}
              </OverviewField>
            </>
          ) : null}
        </dl>
      </section>

      {canonical_parse_error ? (
        <UmercoAlert variant="warning">
          <p className="font-medium">This stored message no longer matches the expected DELJIT format.</p>
          <p className="mt-2 break-all font-mono text-xs leading-relaxed text-umerco-muted">
            {canonical_parse_error}
          </p>
        </UmercoAlert>
      ) : null}

      {lines_consistent_with_message === false ? (
        <UmercoAlert variant="warning">
          <p className="font-medium">Order data differs between the stored message and the portal copy.</p>
          <p className="mt-1 text-umerco-muted">Both views are shown below for traceability.</p>
        </UmercoAlert>
      ) : null}

      <section>
        <SectionTitle>Order</SectionTitle>
        <SectionSubtitle>
          {showSplitOrder
            ? "Compare message payload with the normalized portal record."
            : showSingleOrderFromMessage
              ? "Schedule lines for this delivery release."
              : showSystemOrderOnly
                ? "Schedule lines stored for this release."
                : "No schedule lines for this release."}
        </SectionSubtitle>

        {showSingleOrderFromMessage && message ? (
          <OrderTable
            headers={["Part number", "Description", "Qty", "UoM", "Deliver by", "Facility"]}
            rows={message.payload.lines.map((line, i) => ({
              key: `${line.partNo}-${line.facility}-${i}`,
              cells: [
                { content: line.partNo, mono: true },
                { content: line.description },
                { content: String(line.qtyRequired), align: "right" as const },
                { content: line.uom },
                { content: formatDeliverByDisplay(line.deliverBy), mono: true },
                { content: line.facility, mono: true }
              ]
            }))}
          />
        ) : null}

        {showSplitOrder && message ? (
          <div className="mt-3 space-y-3">
            <p className="umerco-section-label">As received</p>
            <OrderTable
              headers={["Part number", "Description", "Qty", "UoM", "Deliver by", "Facility"]}
              rows={message.payload.lines.map((line, i) => ({
                key: `m-${line.partNo}-${line.facility}-${i}`,
                cells: [
                  { content: line.partNo, mono: true },
                  { content: line.description },
                  { content: String(line.qtyRequired), align: "right" as const },
                  { content: line.uom },
                  { content: formatDeliverByDisplay(line.deliverBy), mono: true },
                  { content: line.facility, mono: true }
                ]
              }))}
            />
            <p className="umerco-section-label">System record</p>
            <OrderTable
              headers={["Line ID", "Part number", "Description", "Qty", "UoM", "Deliver by", "Facility"]}
              rows={lines.map((line) => ({
                key: line.id,
                cells: [
                  { content: `${line.id.slice(0, 8)}…`, mono: true, small: true },
                  { content: line.part_no, mono: true },
                  { content: line.description ?? "—" },
                  { content: String(line.qty_required), align: "right" as const },
                  { content: line.uom },
                  { content: line.deliver_by, mono: true },
                  { content: line.facility, mono: true }
                ]
              }))}
            />
          </div>
        ) : null}

        {showSystemOrderOnly ? (
          <OrderTable
            headers={["Line ID", "Part number", "Description", "Qty", "UoM", "Deliver by", "Facility"]}
            rows={lines.map((line) => ({
              key: line.id,
              cells: [
                { content: `${line.id.slice(0, 8)}…`, mono: true, small: true },
                { content: line.part_no, mono: true },
                { content: line.description ?? "—" },
                { content: String(line.qty_required), align: "right" as const },
                { content: line.uom },
                { content: line.deliver_by, mono: true },
                { content: line.facility, mono: true }
              ]
            }))}
          />
        ) : null}

        {!showSingleOrderFromMessage && !showSplitOrder && !showSystemOrderOnly ? (
          <p className="mt-3 rounded-lg border border-dashed border-umerco-border bg-umerco-canvas px-4 py-4 text-center text-sm text-umerco-muted">
            No order lines on file.
          </p>
        ) : null}
      </section>

      <section className="border-t border-umerco-border pt-4">
        <SectionTitle>Technical</SectionTitle>
        <SectionSubtitle>Raw payload for troubleshooting and integrations.</SectionSubtitle>
        <button
          type="button"
          className="mt-2 text-sm font-medium text-umerco-dark"
          onClick={() => setRawExpanded(!rawExpanded)}
        >
          {rawExpanded ? "Hide" : "Show"} canonical JSON
        </button>
        {rawExpanded ? (
          <pre className="mt-3 rounded-xl border border-umerco-border bg-umerco-canvas p-4 text-xs leading-relaxed text-umerco-dark">
            {JSON.stringify(detail.canonical_json_raw, null, 2)}
          </pre>
        ) : null}
      </section>
    </div>
  );
}

type OrderTableProps = {
  headers: string[];
  rows: {
    key: string;
    cells: {
      content: React.ReactNode;
      mono?: boolean;
      small?: boolean;
      align?: "right";
    }[];
  }[];
};

function OrderTable({ headers, rows }: OrderTableProps) {
  return (
    <div className={`mt-2 ${tableWrap}`}>
      <table className={tableBase}>
        <thead className="border-b border-umerco-border">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className={`${tableHeader} ${header === "Qty" ? "text-right" : ""}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.key} className={`${trHover} ${tableRowClass(index)}`}>
              {row.cells.map((cell, cellIndex) => (
                <td
                  key={`${row.key}-${cellIndex}`}
                  className={`${tdBase} ${cell.mono ? "font-mono text-xs" : ""} ${cell.small ? "text-[11px] text-umerco-muted" : ""} ${cell.align === "right" ? "text-right tabular-nums" : ""}`}
                >
                  {cell.content}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "default"
}: {
  label: string;
  value: number;
  tone?: "default" | "pending" | "acknowledged" | "completed";
}) {
  const toneClass =
    tone === "pending"
      ? "text-umerco-muted"
      : tone === "acknowledged"
        ? "text-umerco-primary"
        : tone === "completed"
          ? "text-umerco-success"
          : "text-umerco-dark";

  return (
    <div className="schedule-stat px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-umerco-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  );
}

function ScheduleActionLink({
  icon,
  label,
  to,
  variant
}: {
  icon: React.ReactNode;
  label: string;
  to: string;
  variant: "primary" | "secondary" | "outline";
}) {
  const variantClass =
    variant === "primary" ? btnPrimary : variant === "outline" ? btnOutline : btnSecondary;

  return (
    <Link className={`${variantClass} gap-2 px-3 py-2.5 text-xs sm:text-sm`} to={to}>
      {icon}
      <span className="truncate">{label}</span>
    </Link>
  );
}
