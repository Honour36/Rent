"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Search, Users, Pencil, Trash2, AlertTriangle } from "@/components/icons";


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
import { useTenants, TenantListItem } from "@/hooks/useTenants";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useDataTableControls } from "@/hooks/useDataTableControls";
import { BulkActionBar } from "@/components/data-table/BulkActionBar";
import { SortableHeader } from "@/components/data-table/SortableHeader";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { Checkbox } from "@/components/ui/checkbox";
import { apiClient } from "@/lib/api-client";
import { AddTenantDialog } from "./_components/add-tenant-dialog";
import { EditTenantDialog } from "./_components/edit-tenant-dialog";

type TenancyFilter = "all" | "active" | "none" | "overdue";

const TENANCY_FILTER_OPTIONS: { value: TenancyFilter; label: string }[] = [
  { value: "all", label: "All Tenants" },
  { value: "active", label: "Active Tenancy" },
  { value: "none", label: "No Tenancy" },
  { value: "overdue", label: "Overdue" },
];

export default function TenantsPage() {
  const router = useRouter();
  const { tenants, loading, error, refetch } = useTenants();
  const [search, setSearch] = useState("");
  const [tenancyFilter, setTenancyFilter] = useState<TenancyFilter>("all");
  const [editTenant, setEditTenant] = useState<TenantListItem | null>(null);
  const [deleteTenant, setDeleteTenant] = useState<TenantListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = tenants.filter((t) => {
    const matchesSearch = t.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesTenancy =
      tenancyFilter === "all" ? true :
      tenancyFilter === "active" ? !!t.activeTenancy :
      tenancyFilter === "none" ? !t.activeTenancy :
      t.isOverdue;
    return matchesSearch && matchesTenancy;
  });

  const { paged, page, pageCount, pageSize, setPage, setPageSize, sortKey, sortDir, toggleSort, totalCount } =
    useDataTableControls(filtered, {
      name: (t) => t.full_name,
      property: (t) => t.activeTenancy?.unit.property.name ?? "",
      tenancy: (t) => (t.activeTenancy ? 1 : 0),
      arrears: (t) => (t.isOverdue ? 1 : 0),
    });

  const bulk = useBulkSelection(paged, (t) => t.id);

  const handleBulkDelete = async () => {
    const ids = Array.from(bulk.selectedIds);
    const res = await apiClient(`/tenants/bulk-delete`, { method: "POST", data: { ids } });
    if (res.success) {
      toast.success(`${ids.length} tenant${ids.length === 1 ? "" : "s"} deleted.`);
    } else {
      toast.error("Could not delete the selected tenants", { description: (res as any).error });
    }
    bulk.clear();
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteTenant) return;
    setDeleting(true);
    const res = await apiClient(`/tenants/${deleteTenant.id}`, { method: "DELETE" });
    if (res.success) {
      toast.success(`"${deleteTenant?.full_name}" removed.`);
      refetch();
    } else {
      toast.error("Could not delete tenant", { description: (res as any).error });
    }
    setDeleteTenant(null);
    setDeleting(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tenants</h1>
          <p className="text-sm text-muted-foreground">Manage all tenant profiles and histories</p>
        </div>
        <AddTenantDialog onSuccess={refetch} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
          <CardDescription>Click a row to view full details. Use the icons to edit or delete.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search tenants..." className="max-w-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={tenancyFilter} onValueChange={(v) => setTenancyFilter(v as TenancyFilter)}>
              <SelectTrigger size="sm" className="w-44">
                <span className="text-muted-foreground">Status:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  {TENANCY_FILTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <BulkActionBar
            count={bulk.selectedCount}
            entityLabelSingular="tenant"
            entityLabelPlural="tenants"
            onClear={bulk.clear}
            onConfirmDelete={handleBulkDelete}
          />

          {loading ? (
            <div className="flex h-32 items-center justify-center"><p className="text-sm text-muted-foreground">Loading...</p></div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : filtered.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border">
              <Users className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">No tenants found</p>
                <p className="text-sm text-muted-foreground">Add a tenant manually or approve an application.</p>
              </div>
              <AddTenantDialog onSuccess={refetch} />
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
                        aria-label="Select all tenants"
                      />
                    </TableHead>
                    <SortableHeader label="Name" sortKey="name" activeSortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Contact</TableHead>
                    <SortableHeader label="Current Property / Unit" sortKey="property" activeSortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <SortableHeader label="Tenancy" sortKey="tenancy" activeSortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <SortableHeader label="Arrears" sortKey="arrears" activeSortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <TableHead className="text-right text-xs font-medium uppercase text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((tenant) => {
                    const t = tenant.activeTenancy;
                    return (
                      <TableRow key={tenant.id} className={`cursor-pointer transition-colors ${tenant.isOverdue ? "bg-red-50/60 dark:bg-red-950/20 hover:bg-red-100/60 border-l-2 border-l-destructive" : "hover:bg-muted/50"}`}
                        onClick={() => router.push(`/dashboard/tenants/${tenant.id}`)}>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={bulk.isSelected(tenant.id)}
                            onCheckedChange={() => bulk.toggle(tenant.id)}
                            aria-label={`Select ${tenant.full_name}`}
                          />
                        </TableCell>
                        <TableCell className="text-sm font-medium text-foreground">{tenant.full_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="text-foreground">{tenant.email ?? "-"}</span>
                            <span className="text-muted-foreground">{tenant.phone ?? "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {t ? (
                            <div className="flex flex-col">
                              <span className="font-medium">{t.unit.property.name}</span>
                              <span className="text-muted-foreground">Unit {t.unit.unit_number}</span>
                            </div>
                          ) : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          {t ? <Badge variant="default">Active</Badge> : <Badge variant="outline">No Tenancy</Badge>}
                        </TableCell>
<TableCell>
                          {tenant.isOverdue ? (
                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                              <AlertTriangle className="h-3 w-3" />Overdue
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Clear</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditTenant(tenant)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTenant(tenant)}>
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
            onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="tenants"
          />
        </CardContent>
      </Card>

      {editTenant && (
        <EditTenantDialog tenant={editTenant} onOpenChange={(v) => { if (!v) setEditTenant(null); }}
          onSuccess={() => { setEditTenant(null); refetch(); }} />
      )}

      <AlertDialog open={!!deleteTenant} onOpenChange={(v) => { if (!v) setDeleteTenant(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTenant?.full_name}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
