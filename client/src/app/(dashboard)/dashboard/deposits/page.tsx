"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "@/components/icons";

import { useDeposits, DepositDto } from "@/hooks/useDeposits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Not started", variant: "outline" },
  partial: { label: "Partially paid", variant: "secondary" },
  paid_in_full: { label: "Paid in full", variant: "default" },
  released: { label: "Released to tenant", variant: "secondary" },
  forfeited: { label: "Forfeited", variant: "destructive" },
};

export default function DepositsPage() {
  const { deposits, loading, error, resolveDeposit } = useDeposits();
  const [resolveTarget, setResolveTarget] = useState<DepositDto | null>(null);
  const [outcome, setOutcome] = useState<"released" | "forfeited">("released");
  const [resolvedAmount, setResolvedAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openResolve = (d: DepositDto) => {
    setResolveTarget(d);
    setOutcome("released");
    setResolvedAmount(String(d.paid_amount));
    setNotes("");
  };

  const handleResolve = async () => {
    if (!resolveTarget) return;
    const amount = Number(resolvedAmount);
    if (Number.isNaN(amount) || amount < 0) {
      toast.warning("Enter a valid amount.");
      return;
    }
    setSubmitting(true);
    const res = await resolveDeposit(resolveTarget.tenancy_id, { outcome, resolvedAmount: amount, notes: notes || undefined });
    setSubmitting(false);
    if (res.success) {
      toast.success(outcome === "released" ? "Deposit released." : "Deposit forfeited.");
      setResolveTarget(null);
    } else {
      toast.error("Could not resolve deposit", { description: (res as any).error });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Deposits</h1>
        <p className="text-sm text-muted-foreground">
          Track deposit installments and resolve them (release or forfeit) when a tenant moves out.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        deposits.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No deposits yet. Deposit tracking starts the first time you record a deposit payment for a tenancy that has a deposit amount set.
          </p>
        ) : (
          <div className="space-y-3">
            {deposits.map((d) => {
              const cfg = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.pending;
              const resolved = d.status === "released" || d.status === "forfeited";
              return (
                <Card key={d.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">
                        {d.tenancy.unit.property.name} - {d.tenancy.unit.unit_number}
                      </p>
                      <p className="text-sm text-muted-foreground">{d.tenancy.tenant.full_name}</p>
                      {resolved && d.resolution_notes && (
                        <p className="text-xs text-muted-foreground mt-1">"{d.resolution_notes}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p>Required: {d.currency} {Number(d.required_amount).toLocaleString()}</p>
                        <p className="text-muted-foreground">
                          {resolved ? `Resolved: ${d.currency} ${Number(d.resolved_amount).toLocaleString()}` : `Paid: ${d.currency} ${d.paid_amount.toLocaleString()}`}
                        </p>
                      </div>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      {!resolved && (
                        <Button size="sm" variant="outline" onClick={() => openResolve(d)}>
                          <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Resolve
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      )}

      <Dialog open={!!resolveTarget} onOpenChange={(v) => !v && setResolveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Deposit</DialogTitle>
          </DialogHeader>
          {resolveTarget && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {resolveTarget.tenancy.tenant.full_name} paid {resolveTarget.currency} {resolveTarget.paid_amount.toLocaleString()} toward a {resolveTarget.currency} {Number(resolveTarget.required_amount).toLocaleString()} deposit.
              </p>
              <div className="space-y-2">
                <Label>Outcome</Label>
                <div className="flex gap-2">
                  <Button type="button" variant={outcome === "released" ? "default" : "outline"} size="sm" onClick={() => setOutcome("released")}>
                    Release to tenant
                  </Button>
                  <Button type="button" variant={outcome === "forfeited" ? "destructive" : "outline"} size="sm" onClick={() => setOutcome("forfeited")}>
                    Forfeit (damage/breach)
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Amount {outcome === "released" ? "Returned" : "Kept"}</Label>
                <Input type="number" step="0.01" value={resolvedAmount} onChange={(e) => setResolvedAmount(e.target.value)} />
                <p className="text-xs text-muted-foreground">Can be partial - e.g. keep part of the deposit for damage, return the rest.</p>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  placeholder="e.g. Kept $50 for a broken window screen, inspected on move-out." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveTarget(null)}>Cancel</Button>
            <Button onClick={handleResolve} disabled={submitting}>{submitting ? "Saving…" : "Confirm"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
