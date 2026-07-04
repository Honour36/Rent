"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { createProperty } from "@/hooks/useProperties";
import { useOwners } from "@/hooks/useOwners";

interface AddPropertyDialogProps {
  onSuccess?: () => void;
}

export function AddPropertyDialog({ onSuccess }: AddPropertyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { owners, loading: loadingOwners } = useOwners();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    suburb: "",
    city: "",
    type: "residential",
    ownerId: "",
    rentAmount: "",
    currency: "USD",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await createProperty({
        ...formData,
        ownerId: formData.ownerId || undefined, // send undefined if empty
      });
      
      if (res.success) {
        setOpen(false);
        setFormData({
          name: "",
          address: "",
          suburb: "",
          city: "",
          type: "residential",
          ownerId: "",
          rentAmount: "",
          currency: "USD",
        });
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || "Failed to create property");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Property</DialogTitle>
          <DialogDescription>
            Enter the details of the new property to add it to your portfolio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && <div className="text-sm font-medium text-destructive">{error}</div>}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Sunset Apartments"
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St"
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="suburb" className="text-right">
                Suburb
              </Label>
              <Input
                id="suburb"
                name="suburb"
                value={formData.suburb}
                onChange={handleChange}
                placeholder="Borrowdale"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                City
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Harare"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <div className="col-span-3">
                <NativeSelect id="type" name="type" value={formData.type} onChange={handleChange} className="w-full">
                  <NativeSelectOption value="residential">Residential</NativeSelectOption>
                  <NativeSelectOption value="commercial">Commercial</NativeSelectOption>
                </NativeSelect>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ownerId" className="text-right">
                Owner
              </Label>
              <div className="col-span-3">
                <NativeSelect id="ownerId" name="ownerId" value={formData.ownerId} onChange={handleChange} className="w-full" disabled={loadingOwners}>
                  <NativeSelectOption value="">-- Select Owner --</NativeSelectOption>
                  {owners.map(owner => (
                    <NativeSelectOption key={owner.id} value={owner.id}>
                      {owner.full_name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rentAmount" className="text-right">
                Default Rent
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="rentAmount"
                  name="rentAmount"
                  type="number"
                  min="0"
                  value={formData.rentAmount}
                  onChange={handleChange}
                  placeholder="e.g. 350"
                  className="flex-1"
                />
                <div className="w-24">
                  <NativeSelect id="currency" name="currency" value={formData.currency} onChange={handleChange} className="w-full">
                    <NativeSelectOption value="USD">USD</NativeSelectOption>
                    <NativeSelectOption value="ZiG">ZiG</NativeSelectOption>
                  </NativeSelect>
                </div>
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Property"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
