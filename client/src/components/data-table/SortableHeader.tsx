"use client";

import { ArrowUpDown, ChevronUpIcon as ChevronUp, ChevronDown } from "@/components/icons";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SortDirection } from "@/hooks/useDataTableControls";

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  activeSortKey: string | null;
  sortDir: SortDirection;
  onSort: (key: string) => void;
  className?: string;
}

export function SortableHeader({ label, sortKey, activeSortKey, sortDir, onSort, className }: SortableHeaderProps) {
  const active = activeSortKey === sortKey;
  return (
    <TableHead className={cn("text-xs font-medium uppercase text-muted-foreground", className)}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        {label}
        {active ? (
          sortDir === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
        )}
      </button>
    </TableHead>
  );
}
