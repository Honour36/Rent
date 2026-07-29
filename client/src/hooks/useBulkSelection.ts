import { useMemo, useState } from "react";

/**
 * Row selection for a data table's current page of visible items. Selection
 * is keyed by id and intentionally does not persist across a refetch (a
 * fresh id list means a fresh selection) - stale ids pointing at rows that
 * no longer exist would otherwise sit invisibly in the set.
 */
export function useBulkSelection<T>(items: T[], getId: (item: T) => string) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const visibleIds = useMemo(() => items.map(getId), [items, getId]);
  const selectedCount = selectedIds.size;
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someSelected = selectedCount > 0 && !allSelected;

  const isSelected = (id: string) => selectedIds.has(id);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) => (allSelected ? new Set() : new Set(visibleIds)));
  };

  const clear = () => setSelectedIds(new Set());

  return { selectedIds, selectedCount, allSelected, someSelected, isSelected, toggle, toggleAll, clear };
}
