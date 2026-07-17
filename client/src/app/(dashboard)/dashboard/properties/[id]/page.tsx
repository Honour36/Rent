"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronLeft, Copy, Check, Pencil, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProperty } from "@/hooks/useProperties";
import { apiClient } from "@/lib/api-client";
import { UnitCard } from "../_components/unit-card";
import { EditPropertyDialog } from "../_components/edit-property-dialog";
import { GenerateUnitLinkButton } from "@/components/properties/GenerateUnitLinkButton";

interface PageProps { params: Promise<{ id: string }> }

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied!" : label}
    </Button>
  );
}

export default function PropertyDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { property, loading, error, refetch } = useProperty(id);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await apiClient(`/properties/${id}`, { method: "DELETE" });
    router.push("/dashboard/properties");
  };

  if (loading) return <div className="flex h-[50vh] items-center justify-center"><p className="text-sm text-muted-foreground">Loading property details...</p></div>;
  if (error || !property) return (
    <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
      <p className="text-sm text-destructive">{error || "Property not found"}</p>
      <Button variant="outline" onClick={() => router.push("/dashboard/properties")}><ChevronLeft className="mr-2 h-4 w-4" />Back to Properties</Button>
    </div>
  );

  const primaryUnit = property.units?.[0];
  const hasExtraUnits = (property.units?.length ?? 0) > 1;
  const vacantCount = property.units?.filter(u => u.status === "vacant").length || 0;
  const occupiedCount = property.units?.filter(u => u.status === "occupied").length || 0;
  const maintenanceCount = property.units?.filter(u => u.status === "maintenance").length || 0;
  const appBase = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/properties")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{property.name}</h1>
          <p className="text-sm text-muted-foreground">
            {property.address}{property.suburb ? `, ${property.suburb}` : ""}{property.city ? `, ${property.city}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}><Pencil className="mr-2 h-4 w-4" />Edit</Button>
          <Button variant="outline" size="sm" className="text-destructive border-destructive/40 hover:bg-destructive/10"
            onClick={() => setShowDelete(true)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
        </div>
      </div>

      {/* Info row */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Owner:</span>
          <span className="font-medium">{property.owner?.full_name ?? "-"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Type:</span>
          <Badge variant="outline" className="capitalize">{property.type}</Badge>
        </div>
        {!hasExtraUnits && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Rent:</span>
              <span className="font-medium">
                {primaryUnit?.rent_amount != null ? `${primaryUnit.currency} ${Number(primaryUnit.rent_amount).toLocaleString()}` : "Not set"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="outline" className="capitalize">{primaryUnit?.status ?? "Needs setup"}</Badge>
            </div>
          </>
        )}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Property ID:</span>
          <code className="text-xs bg-muted px-2 py-0.5 rounded">{property.id}</code>
          <CopyButton text={property.id} label="Copy ID" />
        </div>
      </div>

      {hasExtraUnits && (
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { label: "Total Units", value: property.units?.length || 0, color: "" },
            { label: "Occupied", value: occupiedCount, color: "text-green-600" },
            { label: "Vacant", value: vacantCount, color: "text-amber-500" },
            { label: "Maintenance", value: maintenanceCount, color: "text-red-500" },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
              <CardContent><div className={`text-2xl font-bold ${color}`}>{value}</div></CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {hasExtraUnits ? (
          <>
            <h2 className="text-lg font-semibold">Units</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {property.units!.map((unit) => {
                const appLink = `${appBase}/application/${unit.id}`;
                return (
                  <div key={unit.id} className="flex flex-col gap-2">
                    <UnitCard unit={unit} />
                    <div className="flex items-center gap-2 px-1">
                      <code className="text-xs text-muted-foreground truncate flex-1">ID: {unit.id}</code>
                      <GenerateUnitLinkButton unitId={unit.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : primaryUnit ? (
          <>
            <h2 className="text-lg font-semibold">Application Link</h2>
            <div className="flex flex-col gap-2 max-w-md">
              <UnitCard unit={primaryUnit} />
              <div className="flex items-center gap-2 px-1">
                <code className="text-xs text-muted-foreground truncate flex-1">ID: {primaryUnit.id}</code>
                <GenerateUnitLinkButton unitId={primaryUnit.id} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border">
            <Building2 className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Setting up this property</p>
              <p className="text-sm text-muted-foreground">Edit the property to add a rent amount.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
              <Pencil className="mr-2 h-4 w-4" />Edit Property
            </Button>
          </div>
        )}
      </div>

      {showEdit && (
        <EditPropertyDialog
          property={property as any}
          onOpenChange={(v) => { if (!v) setShowEdit(false); }}
          onSuccess={() => { setShowEdit(false); refetch(); }}
        />
      )}

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{property.name}</strong>? This cannot be undone.
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
