"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, Pencil, Trash2, ArrowRight } from "@/components/icons";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Property } from "@/hooks/useProperties";
import { useProperties } from "@/hooks/useProperties";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useDataTableControls } from "@/hooks/useDataTableControls";
import { BulkActionBar } from "@/components/data-table/BulkActionBar";
import { SortableHeader } from "@/components/data-table/SortableHeader";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { Checkbox } from "@/components/ui/checkbox";
import { apiClient } from "@/lib/api-client";
import { AddPropertyDialog } from "./_components/add-property-dialog";
import { EditPropertyDialog } from "./_components/edit-property-dialog";
import { GenerateUnitLinkButton } from "@/components/properties/GenerateUnitLinkButton";

function isIncomplete(p: Property) {
  // Every property gets a primary unit automatically now, so this should only
  // ever be true for legacy properties saved before that fix.
  return !p.units || p.units.length === 0;
}

function primaryUnit(p: Property) {
  return p.units?.[0];
}

function getVacancyStatus(property: Property) {
  const unit = primaryUnit(property);
  if (!unit) return { label: "Needs setup", variant: "secondary" as const };
  if ((property.units?.length ?? 0) > 1) {
    const vacant = property.units!.filter((u) => u.status === "vacant").length;
    if (vacant === 0) return { label: "Fully Occupied", variant: "default" as const };
    return { label: `${vacant} Vacant`, variant: "outline" as const };
  }
  return unit.status === "occupied"
    ? { label: "Occupied", variant: "default" as const }
    : unit.status === "maintenance"
    ? { label: "Maintenance", variant: "outline" as const }
    : { label: "Vacant", variant: "outline" as const };
}

function formatRent(property: Property) {
  const unit = primaryUnit(property);
  if (!unit || unit.rent_amount == null) return "Not set";
  return `${unit.currency} ${Number(unit.rent_amount).toLocaleString()}`;
}

type StatusCategory = "needs_setup" | "vacant" | "occupied" | "maintenance";

function statusCategory(p: Property): StatusCategory {
  const unit = primaryUnit(p);
  if (!unit) return "needs_setup";
  if ((p.units?.length ?? 0) > 1) {
    const vacant = p.units!.filter((u) => u.status === "vacant").length;
    return vacant > 0 ? "vacant" : "occupied";
  }
  if (unit.status === "maintenance") return "maintenance";
  return unit.status === "occupied" ? "occupied" : "vacant";
}

const STATUS_FILTER_OPTIONS: { value: StatusCategory | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "occupied", label: "Occupied" },
  { value: "vacant", label: "Vacant" },
  { value: "maintenance", label: "Maintenance" },
  { value: "needs_setup", label: "Needs Setup" },
];

export default function PropertiesPage() {
  const router = useRouter();
  const { properties, loading, error, refetch } = useProperties();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusCategory | "all">("all");
  const [editProp, setEditProp] = useState<Property | null>(null);
  const [deleteProp, setDeleteProp] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = properties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || statusCategory(p) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const { paged, page, pageCount, pageSize, setPage, setPageSize, sortKey, sortDir, toggleSort, totalCount } =
    useDataTableControls(filtered, {
      name: (p) => p.name,
      location: (p) => p.address,
      owner: (p) => p.owner?.full_name ?? "",
      rent: (p) => primaryUnit(p)?.rent_amount != null ? Number(primaryUnit(p)!.rent_amount) : null,
      status: (p) => statusCategory(p),
    });

  const bulk = useBulkSelection(paged, (p) => p.id);

  const handleBulkDelete = async () => {
    const ids = Array.from(bulk.selectedIds);
    const res = await apiClient(`/properties/bulk-delete`, { method: "POST", data: { ids } });
    if (res.success) {
      toast.success(`${ids.length} propert${ids.length === 1 ? "y" : "ies"} deleted.`);
    } else {
      toast.error("Could not delete the selected properties", { description: (res as any).error });
    }
    bulk.clear();
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteProp) return;
    setDeleting(true);
    const res = await apiClient(`/properties/${deleteProp.id}`, { method: "DELETE" });
    if (res.success) {
      toast.success(`"${deleteProp.name}" deleted.`);
      refetch();
    } else {
      toast.error("Could not delete property", { description: (res as any).error });
    }
    setDeleteProp(null);
    setDeleting(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="text-sm text-muted-foreground">Manage your property portfolio</p>
        </div>
        <AddPropertyDialog onSuccess={refetch} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Properties</CardTitle>
          <CardDescription>
            Click a row to view details, set the rent amount, and generate an application link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search properties…" className="max-w-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusCategory | "all")}>
              <SelectTrigger size="sm" className="w-40">
                <span className="text-muted-foreground">Status:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  {STATUS_FILTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <BulkActionBar
            count={bulk.selectedCount}
            entityLabelSingular="property"
            entityLabelPlural="properties"
            onClear={bulk.clear}
            onConfirmDelete={handleBulkDelete}
          />

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading…</p>
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">Unable to load properties. Please refresh.</p>
          ) : filtered.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border">
              <Building2 className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">No properties found</p>
                <p className="text-sm text-muted-foreground">Add your first property to get started.</p>
              </div>
              <AddPropertyDialog onSuccess={refetch} />
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={bulk.allSelected ? true : bulk.someSelected ? "indeterminate" : false}
                        onCheckedChange={bulk.toggleAll}
                        aria-label="Select all properties"
                      />
                    </TableHead>
                    <SortableHeader label="Property" sortKey="name" activeSortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <SortableHeader label="Location" sortKey="location" activeSortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <SortableHeader label="Owner" sortKey="owner" activeSortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <SortableHeader label="Rent" sortKey="rent" activeSortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <SortableHeader label="Status" sortKey="status" activeSortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">App Link</TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((prop) => {
                    const status = getVacancyStatus(prop);
                    const incomplete = isIncomplete(prop);
                    return (
                      <TableRow
                        key={prop.id}
                        className={`cursor-pointer transition-colors ${
                          incomplete
                            ? "bg-amber-50/60 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-900/30 border-l-2 border-l-amber-400"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => router.push(`/dashboard/properties/${prop.id}`)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={bulk.isSelected(prop.id)}
                            onCheckedChange={() => bulk.toggle(prop.id)}
                            aria-label={`Select ${prop.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{prop.name}</span>
                            {incomplete && (
                              <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                                <ArrowRight className="h-3 w-3" />
                                Click to finish setup
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="text-foreground">{prop.address}</span>
                            <span className="text-muted-foreground">{[prop.suburb, prop.city].filter(Boolean).join(", ")}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-foreground">{prop.owner?.full_name ?? "-"}</TableCell>
                        <TableCell className="text-sm text-foreground">
                          {formatRent(prop)}
                          {(prop.units?.length ?? 0) > 1 && (
                            <span className="text-muted-foreground text-xs ml-1">({prop.units!.length} units)</span>
                          )}
                        </TableCell>
                        <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {prop.units && prop.units[0]
                            ? <GenerateUnitLinkButton unitId={prop.units[0].id} />
                            : <span className="text-xs text-muted-foreground">Open property to finish setup</span>}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => setEditProp(prop)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteProp(prop)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          <DataTablePagination
            page={page} pageCount={pageCount} pageSize={pageSize} totalCount={totalCount}
            onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="properties"
          />
        </CardContent>
      </Card>

      {editProp && (
        <EditPropertyDialog
          property={editProp}
          onOpenChange={(v) => { if (!v) setEditProp(null); }}
          onSuccess={() => {
            setEditProp(null);
            toast.success("Property updated.");
            refetch();
          }}
        />
      )}

      <AlertDialog open={!!deleteProp} onOpenChange={(v) => { if (!v) setDeleteProp(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteProp?.name}</strong>?
              All associated units and records will be removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Deleting…" : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
