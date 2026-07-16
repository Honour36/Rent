"use client";

import { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { createProperty } from "@/hooks/useProperties";
import { useOwners } from "@/hooks/useOwners";
import { useTenants } from "@/hooks/useTenants";

interface AddPropertyDialogProps { onSuccess?: () => void }

export function AddPropertyDialog({ onSuccess }: AddPropertyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "", address: "", suburb: "", city: "",
    type: "residential", ownerId: "", rentAmount: "", currency: "USD",
    isSingleUnit: false, tenantId: "",
  });

  const { owners, loading: loadingOwners } = useOwners();
  const { tenants, loading: loadingTenants } = useTenants();

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setFieldErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Property name is required.";
    if (!form.address.trim()) errs.address = "Street address is required.";
    if (!form.ownerId) errs.ownerId = "You must select an owner before saving a property.";
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.warning("Please fix the highlighted fields before continuing.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const res = await createProperty({
      ...form,
      ownerId: form.ownerId || undefined,
      rentAmount: form.rentAmount ? parseFloat(form.rentAmount) : undefined,
      tenantId: form.isSingleUnit && form.tenantId ? form.tenantId : undefined,
    } as any);

    if (res.success) {
      toast.success(`"${form.name}" added.`, {
        description: "Open the property to add units and generate an application link.",
        duration: 6000,
      });
      setOpen(false);
      setForm({ name: "", address: "", suburb: "", city: "", type: "residential", ownerId: "", rentAmount: "", currency: "USD", isSingleUnit: false, tenantId: "" });
      setFieldErrors({});
      onSuccess?.();
    } else {
      const msg = (res as any).error || "Could not save the property.";
      if ((res as any).code === "TIER_LIMIT_REACHED") {
        toast.error("Plan limit reached", { description: msg });
      } else {
        toast.error("Could not save property", { description: msg });
      }
    }
    setLoading(false);
  };

  const noOwners = !loadingOwners && owners.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" />Add Property</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Add Property</DialogTitle>
          <DialogDescription>
            Enter the property details. An owner must be selected — add owners first if none appear.
          </DialogDescription>
        </DialogHeader>

        {noOwners && (
          <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-sm text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>No owners on record. <strong>Go to Owners → Add Owner</strong> before adding a property.</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-2">

            <FormField label="Property Name" required error={fieldErrors.name}>
              <Input name="name" value={form.name} onChange={change} placeholder="e.g. Sunset Apartments"
                className={fieldErrors.name ? "border-destructive" : ""} />
            </FormField>

            <FormField label="Street Address" required error={fieldErrors.address}>
              <Input name="address" value={form.address} onChange={change} placeholder="123 Views Drive"
                className={fieldErrors.address ? "border-destructive" : ""} />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Suburb">
                <Input name="suburb" value={form.suburb} onChange={change} placeholder="Borrowdale" />
              </FormField>
              <FormField label="City">
                <Input name="city" value={form.city} onChange={change} placeholder="Harare" />
              </FormField>
            </div>

            <FormField label="Type">
              <NativeSelect name="type" value={form.type} onChange={change} className="w-full">
                <NativeSelectOption value="residential">Residential</NativeSelectOption>
                <NativeSelectOption value="commercial">Commercial</NativeSelectOption>
              </NativeSelect>
            </FormField>

            <FormField label="Owner" required error={fieldErrors.ownerId}>
              <NativeSelect name="ownerId" value={form.ownerId} onChange={change}
                className={`w-full ${fieldErrors.ownerId ? "border-destructive" : ""}`}
                disabled={loadingOwners || noOwners}>
                <NativeSelectOption value="">
                  {loadingOwners ? "Loading owners…" : noOwners ? "No owners — add one first" : "— Select owner —"}
                </NativeSelectOption>
                {owners.map((o) => (
                  <NativeSelectOption key={o.id} value={o.id}>{o.full_name}</NativeSelectOption>
                ))}
              </NativeSelect>
            </FormField>

<div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Single unit property</p>
                <p className="text-xs text-muted-foreground">Auto-creates one "Main Unit" — skip the separate unit step</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.isSingleUnit}
                onClick={() => setForm(p => ({ ...p, isSingleUnit: !p.isSingleUnit }))}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none ${form.isSingleUnit ? "bg-primary" : "bg-input"}`}
              >
                <span className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg transition-transform ${form.isSingleUnit ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>

            <FormField label="Rent Amount" required={form.isSingleUnit}>
              <div className="flex gap-2">
                <Input name="rentAmount" type="number" min="0" value={form.rentAmount} onChange={change} placeholder="e.g. 350" className="flex-1" />
                <div className="w-24">
                  <NativeSelect name="currency" value={form.currency} onChange={change} className="w-full">
                    <NativeSelectOption value="USD">USD</NativeSelectOption>
                    <NativeSelectOption value="ZiG">ZiG</NativeSelectOption>
                  </NativeSelect>
                </div>
              </div>
            </FormField>

            {form.isSingleUnit && (
              <FormField label="Assign Tenant (Optional)">
                <NativeSelect name="tenantId" value={form.tenantId} onChange={change}
                  className="w-full" disabled={loadingTenants}>
                  <NativeSelectOption value="">
                    {loadingTenants ? "Loading tenants…" : "— Skip assigning tenant —"}
                  </NativeSelectOption>
                  {tenants.map((t) => (
                    <NativeSelectOption key={t.id} value={t.id}>{t.full_name}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </FormField>
            )}

          </div>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || noOwners}>
              {loading ? "Saving…" : "Save Property"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
    </div>
  );
}
