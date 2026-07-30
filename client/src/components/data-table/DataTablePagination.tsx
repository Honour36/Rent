"use client";

import {
  Pagination, PaginationContent, PaginationItem,
  PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTablePaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

export function DataTablePagination({
  page, pageCount, pageSize, totalCount, onPageChange, onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100], itemLabel = "items",
}: DataTablePaginationProps) {
  if (totalCount === 0) return null;

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-4 px-1 pt-4 sm:flex-row">
      <div className="flex items-center gap-4 text-muted-foreground text-sm">
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger size="sm" className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent side="top">
              <SelectGroup>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <span>
          Page {page} of {pageCount} &middot; {totalCount} {itemLabel}
        </span>
      </div>

      <Pagination className="mx-0 w-auto justify-start sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#" text=""
              className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
              onClick={(e) => { e.preventDefault(); onPageChange(Math.max(1, page - 1)); }}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="px-2 text-sm tabular-nums text-muted-foreground">{page} / {pageCount}</span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#" text=""
              className={page >= pageCount ? "pointer-events-none opacity-50" : undefined}
              onClick={(e) => { e.preventDefault(); onPageChange(Math.min(pageCount, page + 1)); }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
