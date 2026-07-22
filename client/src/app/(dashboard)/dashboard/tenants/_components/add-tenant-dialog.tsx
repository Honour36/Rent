"use client";
import { toast } from "sonner";

import { useState } from "react";
import { Plus } from "@/components/icons";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { apiClient } from "@/lib/api-client";
import { TenantListItem } from "@/hooks/useTenants";
import { useProperties } from "@/hooks/useProperties";

interface AddTenantDialogProps { onSuccess?: () => void }

export function AddTenantDialog({ onSuccess }: AddTenantDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { properties, loading: propsLoading } = useProperties();

  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", idNumber: "",
    employer: "", employmentStatus: "", monthlyIncome: "",
    propertyId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.warning("Full name is required.");
      return;
    }
    setLoading(true);
    setError("");
    const { propertyId, ...rest } = form;
    const res = await apiClient<TenantListItem>("/tenants", {
      data: { ...rest, monthlyIncome: rest.monthlyIncome ? Number(rest.monthlyIncome) : undefined },
    });
    if (res.success) {
      toast.success('Tenant added successfully.');
      setOpen(false);
      setForm({ fullName: "", email: "", phone: "", idNumber: "", employer: "", employmentStatus: "", monthlyIncome: "", propertyId: "" });
      onSuccess?.();
    } else {
      setError((res as any).error || "Failed to create tenant");
    }
    setLoading(false);
  };

  const field = (id: string, label: string, type = "text", placeholder = "") => (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={id} className="text-right">{label}</Label>
      <Input id={id} name={id} type={type} value={(form as any)[id]} onChange={handleChange}
        placeholder={placeholder} className="col-span-3" />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" />Add Tenant</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Add Tenant</DialogTitle>
          <DialogDescription>Enter the personal details of the new tenant.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && <div className="text-sm font-medium text-destructive">{error}</div>}
            {field("fullName", "Full Name", "text", "Jane Doe")}
            {field("email", "Email", "email", "jane@example.com")}
            <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="phone" className="text-right">Phone</Label>
      <div className="col-span-3">
        <PhoneInput value={form.phone} onChange={(v) => setForm({...form, phone: v})} placeholder="+263 77 123 4567" />
      </div>
    </div>
            {field("idNumber", "ID Number", "text", "63-123456A00")}
            {field("employer", "Employer", "text", "Acme Ltd")}
            {field("employmentStatus", "Emp. Status", "text", "Employed / Self-employed")}
            {field("monthlyIncome", "Monthly Income", "number", "500")}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="propertyId" className="text-right">Property</Label>
              <div className="col-span-3">
                <NativeSelect id="propertyId" name="propertyId" value={form.propertyId}
                  onChange={handleChange} className="w-full" disabled={propsLoading}>
                  <NativeSelectOption value="">-- Currently Renting (optional) --</NativeSelectOption>
                  {properties.map((p) => (
                    <NativeSelectOption key={p.id} value={p.id}>{p.name}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Tenant"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
