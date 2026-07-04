"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { Owner } from "@/hooks/useOwners";

interface Props { owner: Owner; onOpenChange: (v: boolean) => void; onSuccess: () => void }

export function EditOwnerDialog({ owner, onOpenChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: owner.full_name ?? "",
    email: owner.email ?? "",
    phone: owner.phone ?? "",
    bankName: owner.bank_name ?? "",
    bankAccount: owner.bank_account ?? "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await apiClient(`/owners/${owner.id}`, { method: "PATCH", data: form });
    if (res.success) { onSuccess(); onOpenChange(false); }
    else setError((res as any).error || "Failed to update owner");
    setLoading(false);
  };

  const field = (id: string, label: string, type = "text") => (
    <div key={id} className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={id} className="text-right">{label}</Label>
      <Input id={id} name={id} type={type} value={(form as any)[id]} onChange={handleChange} className="col-span-3" />
    </div>
  );

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>Edit Owner</DialogTitle><DialogDescription>Update {owner.full_name}'s details.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && <div className="text-sm font-medium text-destructive">{error}</div>}
            {field("fullName", "Full Name")}
            {field("email", "Email", "email")}
            {field("phone", "Phone")}
            {field("bankName", "Bank Name")}
            {field("bankAccount", "Bank Account")}
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
