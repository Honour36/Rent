"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Property } from "@/hooks/useProperties";
import { useProperties } from "@/hooks/useProperties";
import { apiClient } from "@/lib/api-client";
import { AddPropertyDialog } from "./_components/add-property-dialog";
import { EditPropertyDialog } from "./_components/edit-property-dialog";
import { GenerateUnitLinkButton } from "@/components/properties/GenerateUnitLinkButton";

function getVacancyStatus(property: Property) {
  if (!property.units || property.units.length === 0)
    return { label: "No units", variant: "outline" as const };
  const vacant = property.units.filter((u) => u.status === "vacant").length;
  if (vacant === 0) return { label: "Fully Occupied", variant: "default" as const };
  return { label: `${vacant} Vacant`, variant: "outline" as const };
}

/** Derive the first unit's application link for the property */
function getAppLink(property: Property): string | null {
  const unit = property.units?.[0];
  if (!unit) return null;
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/application/${unit.id}`;
}


export default function PropertiesPage() {
  const router = useRouter();
  const { properties, loading, error, refetch } = useProperties();
  const [search, setSearch] = useState("");
  const [editProp, setEditProp] = useState<Property | null>(null);
  const [deleteProp, setDeleteProp] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = properties.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deleteProp) return;
    setDeleting(true);
    const res = await apiClient(`/properties/${deleteProp.id}`, { method: "DELETE" });
    if (!res.success) {
      toast.error(res.error || "Failed to delete property");
    } else {
      toast.success("Property deleted successfully");
      refetch();
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
          <CardDescription>Click a row to view details. Copy the application link to share with prospective tenants.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search properties..." className="max-w-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center"><p className="text-sm text-muted-foreground">Loading...</p></div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
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
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Property</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Location</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Owner</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Units</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">App Link</TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((prop) => {
                    const status = getVacancyStatus(prop);
                    return (
                      <TableRow
                        key={prop.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => router.push(`/dashboard/properties/${prop.id}`)}
                      >
                        <TableCell className="text-sm font-medium text-foreground">{prop.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="text-foreground">{prop.address}</span>
                            <span className="text-muted-foreground">{prop.suburb} {prop.city}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-foreground">{prop.owner?.full_name ?? "—"}</TableCell>
                        <TableCell className="text-sm text-foreground">{prop.units?.length ?? 0}</TableCell>
                        <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {prop.units && prop.units[0] ? <GenerateUnitLinkButton unitId={prop.units[0].id} /> : <span className="text-muted-foreground text-xs">—</span>}
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
        </CardContent>
      </Card>

      {editProp && (
        <EditPropertyDialog
          property={editProp}
          onOpenChange={(v) => { if (!v) setEditProp(null); }}
          onSuccess={() => { setEditProp(null); refetch(); }}
        />
      )}

      <AlertDialog open={!!deleteProp} onOpenChange={(v) => { if (!v) setDeleteProp(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteProp?.name}</strong>? This cannot be undone.
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
