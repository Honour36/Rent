"use client";

import { useState } from "react";
import { Plus, AlertCircle, ChevronDown, ChevronUp, UserPlus } from "lucide-react";
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
import { useOwners, Owner } from "@/hooks/useOwners";
import { apiClient } from "@/lib/api-client";

interface AddPropertyDialogProps { onSuccess?: () => void }

export function AddPropertyDialog({ onSuccess }: AddPropertyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { owners, loading: loadingOwners, refetch: refetchOwners } = useOwners();

  // Inline quick-add owner state
  const [showAddOwner, setShowAddOwner] = useState(false);
  const [addingOwner, setAddingOwner] = useState(false);
  const [ownerForm, setOwnerForm] = useState({ fullName: "", email: "", phone: "" });

  const [form, setForm] = useState({
    name: "", address: "", suburb: "", city: "",
    type: "residential", ownerId: "", rentAmount: "", currency: "USD",
    isSingleUnit: false,
  });

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
      rentAmount: form.rentAmount ? parseFloat(form.rentAmount) : undefined
    } as any);

    if (res.success) {
      toast.success(`"${form.name}" added.`, {
        description: "Open the property to add units and generate an application link.",
        duration: 6000,
      });
      setOpen(false);
      setForm({ name: "", address: "", suburb: "", city: "", type: "residential", ownerId: "", rentAmount: "", currency: "USD", isSingleUnit: false });
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

  const handleQuickAddOwner = async () => {
    if (!ownerForm.fullName.trim()) {
      toast.warning("Owner name is required.");
      return;
    }
    setAddingOwner(true);
    const res = await apiClient<Owner>("/owners", {
      method: "POST",
      data: ownerForm,
    });
    if (res.success) {
      toast.success(`Owner "${ownerForm.fullName}" added.`);
      await refetchOwners();
      // Auto-select the newly created owner
      setForm((p) => ({ ...p, ownerId: res.data.id }));
      setFieldErrors((p) => ({ ...p, ownerId: "" }));
      setOwnerForm({ fullName: "", email: "", phone: "" });
      setShowAddOwner(false);
    } else {
      toast.error("Could not add owner", { description: (res as any).error });
    }
    setAddingOwner(false);
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
            Enter the property details. Select an existing owner or quickly add a new one.
          </DialogDescription>
        </DialogHeader>

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
              <div className="flex gap-2">
                <NativeSelect name="ownerId" value={form.ownerId} onChange={change}
                  className={`flex-1 ${fieldErrors.ownerId ? "border-destructive" : ""}`}
                  disabled={loadingOwners}>
                  <NativeSelectOption value="">
                    {loadingOwners ? "Loading owners…" : noOwners ? "No owners yet" : "— Select owner —"}
                  </NativeSelectOption>
                  {owners.map((o) => (
                    <NativeSelectOption key={o.id} value={o.id}>{o.full_name}</NativeSelectOption>
                  ))}
                </NativeSelect>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setShowAddOwner(!showAddOwner)}
                  title={showAddOwner ? "Close" : "Quick add owner"}
                >
                  {showAddOwner ? <ChevronUp className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                </Button>
              </div>
            </FormField>

            {/* Inline quick-add owner mini-form */}
            {showAddOwner && (
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3 space-y-3">
                <p className="text-xs font-medium text-primary flex items-center gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" />Quick Add Owner
                </p>
                <Input
                  placeholder="Full name *"
                  value={ownerForm.fullName}
                  onChange={(e) => setOwnerForm((p) => ({ ...p, fullName: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Email"
                    type="email"
                    value={ownerForm.email}
                    onChange={(e) => setOwnerForm((p) => ({ ...p, email: e.target.value }))}
                  />
                  <Input
                    placeholder="Phone"
                    value={ownerForm.phone}
                    onChange={(e) => setOwnerForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  disabled={addingOwner || !ownerForm.fullName.trim()}
                  onClick={handleQuickAddOwner}
                >
                  {addingOwner ? "Adding…" : "Add Owner & Select"}
                </Button>
              </div>
            )}

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

          </div>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
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
      {error && <p className="text-xs text-destructive flex items-center gap-1">{error}</p>}
    </div>
  );
}
