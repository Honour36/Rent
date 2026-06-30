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
import { createUnit } from "@/hooks/useProperties";

interface AddUnitDialogProps {
  propertyId: string;
  onSuccess?: () => void;
}

export function AddUnitDialog({ propertyId, onSuccess }: AddUnitDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    unitNumber: "",
    bedrooms: "",
    bathrooms: "",
    rentAmount: "",
    currency: "USD",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await createUnit({
        propertyId,
        unitNumber: formData.unitNumber,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        rentAmount: parseFloat(formData.rentAmount),
        currency: formData.currency,
      });
      
      if (res.success) {
        setOpen(false);
        setFormData({
          unitNumber: "",
          bedrooms: "",
          bathrooms: "",
          rentAmount: "",
          currency: "USD",
        });
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || "Failed to create unit");
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
          Add Unit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Unit</DialogTitle>
          <DialogDescription>
            Add a new unit to this property.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && <div className="text-sm font-medium text-destructive">{error}</div>}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unitNumber" className="text-right">
                Unit Number
              </Label>
              <Input
                id="unitNumber"
                name="unitNumber"
                value={formData.unitNumber}
                onChange={handleChange}
                placeholder="e.g. 101, A, etc."
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bedrooms" className="text-right">
                Bedrooms
              </Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={handleChange}
                placeholder="2"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bathrooms" className="text-right">
                Bathrooms
              </Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                min="0"
                value={formData.bathrooms}
                onChange={handleChange}
                placeholder="1"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rentAmount" className="text-right">
                Rent
              </Label>
              <div className="col-span-3 flex gap-2">
                <NativeSelect id="currency" name="currency" value={formData.currency} onChange={handleChange} className="w-24">
                  <NativeSelectOption value="USD">USD</NativeSelectOption>
                  <NativeSelectOption value="ZiG">ZiG</NativeSelectOption>
                </NativeSelect>
                <Input
                  id="rentAmount"
                  name="rentAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.rentAmount}
                  onChange={handleChange}
                  placeholder="500.00"
                  className="flex-1"
                  required
                />
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Unit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
