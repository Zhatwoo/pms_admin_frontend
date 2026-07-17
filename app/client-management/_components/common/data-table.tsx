"use client";

// ═══════════════════════════════════════════════════════════
// Data Table — TanStack-powered enterprise table
// Sorting, pagination, column visibility, responsive.
// ═══════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState as TanStackSortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  searchValue?: string;
  searchColumn?: string;
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  emptyMessage?: string;
}

export function DataTable<TData>({
  columns,
  data,
  searchValue = "",
  searchColumn,
  pageSize = 10,
  onRowClick,
  emptyMessage = "No results found.",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<TanStackSortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Apply search filter
  const filteredData = useMemo(() => {
    if (!searchValue || !searchColumn) return data;
    const lower = searchValue.toLowerCase();
    return data.filter((row) => {
      const val = (row as Record<string, unknown>)[searchColumn];
      return typeof val === "string" && val.toLowerCase().includes(lower);
    });
  }, [data, searchValue, searchColumn]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();

  return (
    <div className="space-y-3">
      {/* Table */}
      <div
        className="overflow-hidden rounded-xl border"
        style={{ background: "var(--cm-surface)", borderColor: "var(--cm-border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b"
                  style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface-secondary)" }}
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--cm-text-tertiary)" }}
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          className={`inline-flex items-center gap-1 ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="ml-1">
                              {header.column.getIsSorted() === "asc" ? (
                                <ArrowUp size={12} />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ArrowDown size={12} />
                              ) : (
                                <ArrowUpDown size={12} style={{ opacity: 0.3 }} />
                              )}
                            </span>
                          )}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-sm"
                    style={{ color: "var(--cm-text-muted)" }}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b transition-colors last:border-b-0 ${onRowClick ? "cursor-pointer" : ""}`}
                    style={{ borderColor: "var(--cm-border-subtle)" }}
                    onClick={() => onRowClick?.(row.original)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cm-surface-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="whitespace-nowrap px-4 py-3"
                        style={{ color: "var(--cm-text-secondary)" }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--cm-text-muted)" }}>
            Showing {pageIndex * pageSize + 1}–{Math.min((pageIndex + 1) * pageSize, filteredData.length)} of {filteredData.length}
          </p>
          <div className="flex items-center gap-1">
            <PagButton disabled={!table.getCanPreviousPage()} onClick={() => table.setPageIndex(0)}>
              <ChevronsLeft size={14} />
            </PagButton>
            <PagButton disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
              <ChevronLeft size={14} />
            </PagButton>
            <span
              className="px-3 text-xs font-medium"
              style={{ color: "var(--cm-text-secondary)" }}
            >
              {pageIndex + 1} / {pageCount}
            </span>
            <PagButton disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
              <ChevronRight size={14} />
            </PagButton>
            <PagButton disabled={!table.getCanNextPage()} onClick={() => table.setPageIndex(pageCount - 1)}>
              <ChevronsRight size={14} />
            </PagButton>
          </div>
        </div>
      )}
    </div>
  );
}

function PagButton({ children, disabled, onClick }: { children: React.ReactNode; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-colors disabled:opacity-30"
      style={{
        borderColor: "var(--cm-border)",
        color: "var(--cm-text-secondary)",
        background: "var(--cm-surface)",
      }}
    >
      {children}
    </button>
  );
}
