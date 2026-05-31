import Link from "next/link";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  loading?: boolean;
  emptyMessage?: string;
  caption?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  loading = false,
  emptyMessage = "No records found.",
  caption,
}: DataTableProps<T>) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-busy={loading}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 rounded bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={String(row[keyField])} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 text-gray-700", col.className)}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  buildHref: (page: number) => string;
}

export function Pagination({ page, total, pageSize, buildHref }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
      <p className="text-xs text-gray-500">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex items-center gap-1">
        <PageLink href={buildHref(page - 1)} disabled={page === 1} label="Previous page">
          ←
        </PageLink>
        {pages.map((p) => (
          <PageLink key={p} href={buildHref(p)} active={p === page} label={`Page ${p}`}>
            {p}
          </PageLink>
        ))}
        <PageLink href={buildHref(page + 1)} disabled={page === totalPages} label="Next page">
          →
        </PageLink>
      </div>
    </div>
  );
}

function PageLink({
  href,
  children,
  disabled,
  active,
  label,
}: {
  href: string;
  children: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
  label: string;
}) {
  const className = cn(
    "flex h-8 min-w-[2rem] items-center justify-center rounded px-2 text-sm font-medium transition-colors",
    active ? "bg-[#c9a227] text-white" : "text-gray-600 hover:bg-gray-100"
  );

  if (disabled) {
    return (
      <span className={cn(className, "pointer-events-none opacity-40")} aria-hidden="true">
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className} aria-label={label} aria-current={active ? "page" : undefined}>
      {children}
    </Link>
  );
}
