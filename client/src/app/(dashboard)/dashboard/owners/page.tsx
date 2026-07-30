"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Search, UserCheck, Pencil, Trash2 } from "@/components/icons";

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
import { useOwners, Owner } from "@/hooks/useOwners";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useDataTableControls } from "@/hooks/useDataTableControls";
import { BulkActionBar } from "@/components/data-table/BulkActionBar";
import { SortableHeader } from "@/components/data-table/SortableHeader";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { Checkbox } from "@/components/ui/checkbox";
import { apiClient } from "@/lib/api-client";
import { AddOwnerDialog } from "./_components/add-owner-dialog";
import { EditOwnerDialog } from "./_components/edit-owner-dialog";

type BankDetailsFilter = "all" | "complete" | "missing";

export default function OwnersPage() {
  const router = useRouter();
  const { owners, loading, error, refetch } = useOwners();
  const [search, setSearch] = useState("");
  const [bankFilter, setBankFilter] = useState<BankDetailsFilter>("all");
  const [editOwner, setEditOwner] = useState<Owner | null>(null);
  const [deleteOwner, setDeleteOwner] = useState<Owner | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = owners.filter((o) => {
    const matchesSearch = o.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesBank =
      bankFilter === "all" ? true : bankFilter === "complete" ? !!o.bank_name : !o.bank_name;
    return matchesSearch && matchesBank;
  });

  const { paged, page, pageCount, pageSize, setPage, setPageSize, sortKey, sortDir, toggleSort, totalCount } =
    useDataTableControls(filtered, {
      name: (o) => o.full_name,
      properties: (o) => (o as any).properties?.length ?? 0,
      bank: (o) => (o.bank_name ? 1 : 0),
    });

  const bulk = useBulkSelection(paged, (o) => o.id);

  const handleBulkDelete = async () => {
    const ids = Array.from(bulk.selectedIds);
    const res = await apiClient(`/owners/bulk-delete`, { method: "POST", data: { ids } });
    if (res.success) {
      toast.success(`${ids.length} owner${ids.length === 1 ? "" : "s"} deleted.`);
    } else {
      toast.error("Could not delete the selected owners", { description: (res as any).error });
    }
    bulk.clear();
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteOwner) return;
    setDeleting(true);
    const res = await apiClient(`/owners/${deleteOwner.id}`, { method: "DELETE" });
    if (res.success) {
      toast.success(`"${deleteOwner?.full_name}" removed.`);
      refetch();
    } else {
      toast.error("Could not delete owner", { description: (res as any).error });
    }
    setDeleteOwner(null);
    setDeleting(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Owners</h1>
          <p className="text-sm text-muted-foreground">Manage property owner profiles and bank details</p>
        </div>
        <AddOwnerDialog onSuccess={refetch} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Owners</CardTitle>
          <CardDescription>Click a row to view details. Use the icons to edit or delete.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search owners..." className="max-w-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={bankFilter} onValueChange={(v) => setBankFilter(v as BankDetailsFilter)}>
              <SelectTrigger size="sm" className="w-48">
                <span className="text-muted-foreground">Bank Details:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  <SelectItem value="all">All Owners</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="missing">Missing</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <BulkActionBar
            count={bulk.selectedCount}
            entityLabelSingular="owner"
            entityLabelPlural="owners"
            onClear={bulk.clear}
            onConfirmDelete={handleBulkDelete}
          />

          {loading ? (
            <div className="flex h-32 items-center justify-center"><p className="text-sm text-muted-foreground">Loading...</p></div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : filtered.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border">
              <UserCheck className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">No owners found</p>
                <p className="text-sm text-muted-foreground">Add a property owner to get started.</p>
              </div>
              <AddOwnerDialog onSuccess={refetch} />
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
                        aria-label="Select all owners"
                      />
                    </TableHead>
                    <SortableHeader label="Name" sortKey="name" activeSortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Contact</TableHead>
                    <SortableHeader label="Properties" sortKey="properties" activeSortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <SortableHeader label="Bank Details" sortKey="bank" activeSortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <TableHead className="text-right text-xs font-medium uppercase text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((owner) => (
                    <TableRow key={owner.id} className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/owners/${owner.id}`)}>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={bulk.isSelected(owner.id)}
                          onCheckedChange={() => bulk.toggle(owner.id)}
                          aria-label={`Select ${owner.full_name}`}
                        />
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {owner.full_name}
                        {owner.is_diaspora && <Badge variant="secondary" className="ml-2">Diaspora</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="text-foreground">{owner.email ?? "-"}</span>
                          <span className="text-muted-foreground">{owner.phone ?? "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                          {(owner as any).properties?.length > 0 ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium">{(owner as any).properties.length} propert{(owner as any).properties.length === 1 ? 'y' : 'ies'}</span>
                              <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                                {(owner as any).properties.slice(0, 2).map((p: any) => p.name).join(', ')}
                                {(owner as any).properties.length > 2 ? ` +${(owner as any).properties.length - 2}` : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                      <TableCell>
                        {owner.bank_name ? <Badge variant="default">Complete</Badge> : <Badge variant="outline">Missing</Badge>}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditOwner(owner)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteOwner(owner)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <DataTablePagination
            page={page} pageCount={pageCount} pageSize={pageSize} totalCount={totalCount}
            onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="owners"
          />
        </CardContent>
      </Card>

      {editOwner && (
        <EditOwnerDialog owner={editOwner} onOpenChange={(v) => { if (!v) setEditOwner(null); }}
          onSuccess={() => { setEditOwner(null); refetch(); }} />
      )}

      <AlertDialog open={!!deleteOwner} onOpenChange={(v) => { if (!v) setDeleteOwner(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Owner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteOwner?.full_name}</strong>? This cannot be undone.
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
