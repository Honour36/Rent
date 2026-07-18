"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Receipt } from "lucide-react";

import { useLevyCharges } from "@/hooks/useLevyCharges";
import { useProperties } from "@/hooks/useProperties";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FREQUENCY_LABEL: Record<string, string> = {
  one_off: "One-off",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

export default function LeviesPage() {
  const { levyCharges, loading, error, createLevyCharge, deactivateLevyCharge } = useLevyCharges();
  const { properties } = useProperties();

  const [open, setOpen] = useState(false);
  const [propertyId, setPropertyId] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [frequency, setFrequency] = useState<"one_off" | "monthly" | "quarterly" | "annual">("monthly");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!propertyId || !name || !amount) {
      toast.warning("Choose a property, name, and amount.");
      return;
    }
    setSaving(true);
    const res = await createLevyCharge({ propertyId, name, amount: Number(amount), currency, frequency, notes: notes || undefined });
    setSaving(false);
    if (res.success) {
      toast.success("Levy charge added.");
      setOpen(false);
      setPropertyId(""); setName(""); setAmount(""); setNotes("");
    } else {
      toast.error("Could not add levy charge", { description: (res as any).error });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Levies</h1>
          <p className="text-sm text-muted-foreground">
            Levy charges configured per property - terms and amounts vary, so each property has its own list.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1.5" />Add Levy</Button>
      </div>

      {loading && <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        levyCharges.length === 0 ? (
          <p className="text-sm text-muted-foreground">No levies configured yet.</p>
        ) : (
          <div className="space-y-2">
            {levyCharges.map((l) => (
              <Card key={l.id} className={!l.active ? "opacity-60" : undefined}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm flex items-center gap-1.5"><Receipt className="h-3.5 w-3.5" />{l.name}</p>
                    <p className="text-xs text-muted-foreground">{l.property.name}</p>
                    {l.notes && <p className="text-xs text-muted-foreground mt-1">{l.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <p className="font-medium">{l.currency} {Number(l.amount).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{FREQUENCY_LABEL[l.frequency]}</p>
                    </div>
                    {l.active ? (
                      <Button size="sm" variant="ghost" onClick={() => deactivateLevyCharge(l.id)}>Deactivate</Button>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Levy Charge</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Property</Label>
              <SearchableSelect
                options={properties.map(p => ({ value: p.id, label: p.name }))}
                value={propertyId}
                onChange={setPropertyId}
                placeholder="Select a property…"
              />
            </div>
            <div className="space-y-2">
              <Label>Levy Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Municipal Levy, HOA Levy" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_off">One-off</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? "Saving…" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
