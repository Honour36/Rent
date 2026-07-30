"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useReports, ArrearsReportItem } from "@/hooks/useReports";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Pencil } from "@/components/icons";

export default function ArrearsReportPage() {
  const { getArrearsReport, addArrears, clearArrears, loading, error } = useReports();
  const [data, setData] = useState<ArrearsReportItem[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [editing, setEditing] = useState<ArrearsReportItem | null>(null);

  const load = useCallback(async () => {
    const rows = await getArrearsReport(showAll);
    setData(rows);
  }, [getArrearsReport, showAll]);

  useEffect(() => { load(); }, [load]);

  const inArrearsCount = data.filter(d => d.amountOwed > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Arrears</h1>
          <p className="text-muted-foreground mt-2">
            Outstanding balances are calculated automatically from lease start date and rent payments received.
            Migrated data can be incomplete or wrong - use Edit to add an arrear it missed, or clear one that isn&apos;t really owed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="show-all" size="sm" checked={showAll} onCheckedChange={setShowAll} />
          <Label htmlFor="show-all" className="text-sm text-muted-foreground cursor-pointer">
            Show all active tenants
          </Label>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{showAll ? "All Active Tenancies" : "Outstanding Balances"}</CardTitle>
          <CardDescription>
            {showAll
              ? "Every active tenancy, including those with no balance owed - pick one to add an arrear."
              : `${inArrearsCount} tenant${inArrearsCount === 1 ? "" : "s"} currently in arrears.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property / Unit</TableHead>
                  <TableHead>Amount Owed</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
                ) : data.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No arrears found.</TableCell></TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.tenancyId}>
                      <TableCell className="font-medium">{item.tenantName}</TableCell>
                      <TableCell>{item.propertyName}, Unit {item.unitNumber}</TableCell>
                      <TableCell className="font-mono">
                        {item.currency === "USD" ? "$" : "ZiG "}{item.amountOwed.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {item.amountOwed > 0 ? (
                          <Badge variant="destructive">{item.daysOverdue} days</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs" onClick={() => setEditing(item)}>
                          <Pencil className="h-3 w-3" />Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editing && (
        <EditArrearsDialog
          item={editing}
          onOpenChange={(open) => { if (!open) setEditing(null); }}
          onAdd={async (amount) => {
            const res = await addArrears(editing.tenancyId, amount);
            if (!res.success) {
              toast.error("Could not add arrears", { description: res.error });
              return;
            }
            toast.success(`Added to ${editing.tenantName}'s arrears.`);
            setEditing(null);
            load();
          }}
          onClear={async () => {
            const res = await clearArrears(editing.tenancyId);
            if (!res.success) {
              toast.error("Could not clear arrears", { description: res.error });
              return;
            }
            toast.success(`Arrears cleared for ${editing.tenantName}.`);
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function EditArrearsDialog({ item, onOpenChange, onAdd, onClear }: {
  item: ArrearsReportItem;
  onOpenChange: (open: boolean) => void;
  onAdd: (amount: number) => Promise<void>;
  onClear: () => Promise<void>;
}) {
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  const parsed = Number(amount);
  const canAdd = amount.trim() !== "" && Number.isFinite(parsed) && parsed > 0;

  const handleAdd = async () => {
    if (!canAdd) return;
    setSaving(true);
    await onAdd(parsed);
    setSaving(false);
  };

  const handleClear = async () => {
    setClearing(true);
    await onClear();
    setClearing(false);
  };

  const currencySymbol = item.currency === "USD" ? "$" : "ZiG ";

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Edit Arrears - {item.tenantName}</DialogTitle>
          <DialogDescription>{item.propertyName}, Unit {item.unitNumber}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="flex items-center justify-between text-sm rounded-md bg-muted px-3 py-2">
            <span className="font-medium">Currently owed</span>
            <span className="font-mono font-semibold">{currencySymbol}{item.amountOwed.toFixed(2)}</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-amount" className="text-sm font-medium">Add arrears amount</Label>
            <Input
              id="add-amount" type="number" min="0" step="0.01" placeholder="e.g. 150"
              value={amount} onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter what this tenant owes that isn&apos;t already reflected above - it adds on top of the current total.
            </p>
          </div>

          <Button type="button" onClick={handleAdd} disabled={!canAdd || saving || clearing}>
            {saving ? "Adding…" : "Add to arrears"}
          </Button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />or<div className="h-px flex-1 bg-border" />
          </div>

          <Button type="button" variant="outline" onClick={handleClear} disabled={saving || clearing || item.amountOwed === 0}>
            {clearing ? "Clearing…" : "Clear arrears to zero"}
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={saving || clearing}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
