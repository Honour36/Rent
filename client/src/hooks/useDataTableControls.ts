import { useEffect, useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

export type SortAccessors<T> = Record<string, (item: T) => string | number | Date | null | undefined>;

interface UseDataTableControlsOptions {
  pageSize?: number;
  initialSortKey?: string;
  initialSortDir?: SortDirection;
}

/**
 * Adds client-side sorting + pagination on top of an already-filtered array,
 * without requiring the page to be rewritten around @tanstack/react-table
 * column definitions. Existing list pages here have a lot of bespoke row
 * markup (bulk-select checkboxes, click-to-navigate rows, two-line cells,
 * conditional row styling) - forcing that into column defs is a large,
 * risky rewrite for what's fundamentally a sort/page/filter request. This
 * hook gets the same outcome by operating on the plain array the page
 * already builds.
 *
 * Usage: filter your data yourself (search text, dropdown filters) as
 * before, then pass the filtered array in here for sort + page.
 */
export function useDataTableControls<T>(
  items: T[],
  sortAccessors: SortAccessors<T>,
  options: UseDataTableControlsOptions = {},
) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(options.pageSize ?? 10);
  const [sortKey, setSortKey] = useState<string | null>(options.initialSortKey ?? null);
  const [sortDir, setSortDir] = useState<SortDirection>(options.initialSortDir ?? "asc");

  // biome-ignore lint/correctness/useExhaustiveDependencies: sortAccessors is typically an inline object literal from the caller - including it would defeat the memo, recomputing every render regardless of sort state.
  const sorted = useMemo(() => {
    const accessor = sortKey ? sortAccessors[sortKey] : undefined;
    if (!accessor) return items;
    return [...items].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      let cmp: number;
      if (av instanceof Date && bv instanceof Date) cmp = av.getTime() - bv.getTime();
      else if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [items, sortKey, sortDir]);

  // A changed result count almost always means the caller's own search/
  // filter state just changed - jump back to page 1 so the new result set
  // isn't silently viewed from a stale, possibly out-of-range page.
  // biome-ignore lint/correctness/useExhaustiveDependencies: items.length is deliberately the only dependency - it's not read in the effect body, it's the trigger.
  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paged = useMemo(
    () => sorted.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sorted, safePage, pageSize],
  );

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return {
    paged,
    totalCount: sorted.length,
    page: safePage,
    pageCount,
    pageSize,
    setPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
    sortKey,
    sortDir,
    toggleSort,
  };
}
