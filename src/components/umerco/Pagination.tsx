import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export type PaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  itemLabel?: string;
};

function pageRange(page: number, pageSize: number, totalItems: number) {
  if (totalItems === 0) return { start: 0, end: 0 };
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  return { start, end };
}

function pageNumbers(page: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];

  if (page > 3) pages.push("ellipsis");

  const rangeStart = Math.max(2, page - 1);
  const rangeEnd = Math.min(totalPages - 1, page + 1);
  for (let current = rangeStart; current <= rangeEnd; current += 1) {
    pages.push(current);
  }

  if (page < totalPages - 2) pages.push("ellipsis");
  pages.push(totalPages);

  return pages;
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  pageSizeOptions = [5, 10, 20],
  onPageChange,
  onPageSizeChange,
  itemLabel = "items"
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const { start, end } = pageRange(safePage, pageSize, totalItems);
  const pages = pageNumbers(safePage, totalPages);

  return (
    <div className="schedule-panel flex flex-col gap-4 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-umerco-muted">
        {totalItems === 0 ? (
          <>No {itemLabel}</>
        ) : (
          <>
            Showing{" "}
            <span className="font-medium text-umerco-dark">
              {start}–{end}
            </span>{" "}
            of <span className="font-medium text-umerco-dark">{totalItems}</span> {itemLabel}
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-umerco-muted">
          <span className="whitespace-nowrap">Per page</span>
          <select
            className="umerco-input w-auto min-w-[4.5rem] px-2.5 py-1.5 text-sm"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            aria-label="Items per page"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <nav className="flex items-center gap-1" aria-label="Pagination">
          <PaginationButton
            label="Previous page"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </PaginationButton>

          {pages.map((entry, index) =>
            entry === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-1 text-sm text-umerco-muted" aria-hidden>
                …
              </span>
            ) : (
              <PaginationButton
                key={entry}
                label={`Page ${entry}`}
                active={entry === safePage}
                onClick={() => onPageChange(entry)}
              >
                {entry}
              </PaginationButton>
            )
          )}

          <PaginationButton
            label="Next page"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </PaginationButton>
        </nav>
      </div>
    </div>
  );
}

function PaginationButton({
  children,
  label,
  active = false,
  disabled = false,
  onClick
}: {
  children: ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-sm font-medium transition-colors",
        active
          ? "pagination-page-active"
          : "text-umerco-muted hover:bg-umerco-canvas hover:text-umerco-dark",
        disabled ? "cursor-not-allowed opacity-40" : ""
      ].join(" ")}
    >
      {children}
    </button>
  );
}
