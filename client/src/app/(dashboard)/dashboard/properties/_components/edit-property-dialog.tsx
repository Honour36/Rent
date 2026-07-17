"use client";
import { toast } from "sonner";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useOwners } from "@/hooks/useOwners";
import { apiClient } from "@/lib/api-client";
import type { Property } from "@/hooks/useProperties";
import { AddUnitDialog } from "./add-unit-dialog";

interface EditPropertyDialogProps {
  property: Property;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditPropertyDialog({ property, onOpenChange, onSuccess }: EditPropertyDialogProps) {
  const { owners, loading: loadingOwners } = useOwners();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Rent amount lives on the property's primary unit under the hood - a
  // property is never truly "unit-less" (one is always created behind the
  // scenes), so units[0] is always the property itself here.
  const primaryUnit = property.units?.[0];
  const hasExtraUnits = (property.units?.length ?? 0) > 1;

  const [form, setForm] = useState({
    name: property.name ?? "",
    address: property.address ?? "",
    suburb: property.suburb ?? "",
    city: property.city ?? "",
    type: property.type ?? "residential",
    ownerId: property.owner?.id ?? "",
    rentAmount: primaryUnit?.rent_amount != null ? String(primaryUnit.rent_amount) : "",
    currency: primaryUnit?.currency ?? "USD",
  });

  useEffect(() => {
    setForm({
      name: property.name ?? "",
      address: property.address ?? "",
      suburb: property.suburb ?? "",
      city: property.city ?? "",
      type: property.type ?? "residential",
      ownerId: property.owner?.id ?? "",
      rentAmount: primaryUnit?.rent_amount != null ? String(primaryUnit.rent_amount) : "",
      currency: primaryUnit?.currency ?? "USD",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await apiClient(`/properties/${property.id}`, {
      method: "PATCH",
      data: {
        ...form,
        rentAmount: form.rentAmount === "" ? "" : parseFloat(form.rentAmount),
      },
    });
    if (res.success) { toast.success("Property updated."); onSuccess(); onOpenChange(false); }
    else setError((res as any).error || "Failed to update property");
    setLoading(false);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>Update the details for {property.name}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[65vh] overflow-y-auto pr-1">
            {error && <div className="text-sm font-medium text-destructive">{error}</div>}
            {[
              { id: "name", label: "Name", placeholder: "Sunset Apartments" },
              { id: "address", label: "Address", placeholder: "123 Main St" },
              { id: "suburb", label: "Suburb", placeholder: "Borrowdale" },
              { id: "city", label: "City", placeholder: "Harare" },
            ].map(({ id, label, placeholder }) => (
              <div key={id} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={id} className="text-right">{label}</Label>
                <Input id={id} name={id} value={(form as any)[id]} onChange={handleChange} placeholder={placeholder} className="col-span-3" />
              </div>
            ))}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <div className="col-span-3">
                <NativeSelect id="type" name="type" value={form.type} onChange={handleChange} className="w-full">
                  <NativeSelectOption value="residential">Residential</NativeSelectOption>
                  <NativeSelectOption value="commercial">Commercial</NativeSelectOption>
                </NativeSelect>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ownerId" className="text-right">Owner</Label>
              <div className="col-span-3">
                <NativeSelect id="ownerId" name="ownerId" value={form.ownerId} onChange={handleChange} className="w-full" disabled={loadingOwners}>
                  <NativeSelectOption value="">-- Select Owner --</NativeSelectOption>
                  {owners.map((o) => (
                    <NativeSelectOption key={o.id} value={o.id}>{o.full_name}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </div>

            {!hasExtraUnits && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rentAmount" className="text-right">Rent Amount</Label>
                <div className="col-span-3 flex gap-2">
                  <Input id="rentAmount" name="rentAmount" type="number" min="0" value={form.rentAmount}
                    onChange={handleChange} placeholder="e.g. 350" className="flex-1 min-w-0" />
                  <div className="w-20 shrink-0">
                    <NativeSelect name="currency" value={form.currency} onChange={handleChange} className="w-full">
                      <NativeSelectOption value="USD">USD</NativeSelectOption>
                      <NativeSelectOption value="ZiG">ZiG</NativeSelectOption>
                    </NativeSelect>
                  </div>
                </div>
              </div>
            )}

            {hasExtraUnits && (
              <p className="text-xs text-muted-foreground col-span-4">
                This property has multiple units - rent is set per unit on the property page instead of here.
              </p>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-right text-sm text-muted-foreground">Multiple units?</span>
              <div className="col-span-3">
                <AddUnitDialog propertyId={property.id} onSuccess={onSuccess} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
