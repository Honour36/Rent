"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ClipboardCheck, Loader2, Plus } from "lucide-react";

import { useInspections, InspectionDto } from "@/hooks/useInspections";
import { useTenants } from "@/hooks/useTenants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TYPE_LABEL: Record<string, string> = { move_in: "Move-In", periodic: "Periodic", move_out: "Move-Out" };
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  scheduled: "outline",
  completed: "secondary",
  cancelled: "destructive",
};

export default function InspectionsPage() {
  const { inspections, loading, error, scheduleInspection, completeInspection, cancelInspection } = useInspections();
  const { tenants } = useTenants();

  const activeTenancies = tenants
    .filter((t) => t.activeTenancy)
    .map((t) => ({
      tenancyId: t.activeTenancy!.id,
      tenantName: t.full_name,
      unitNumber: t.activeTenancy!.unit.unit_number,
      propertyName: t.activeTenancy!.unit.property.name,
    }));

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [tenancyId, setTenancyId] = useState("");
  const [type, setType] = useState<"move_in" | "periodic" | "move_out">("periodic");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [scheduling, setScheduling] = useState(false);

  const [completeTarget, setCompleteTarget] = useState<InspectionDto | null>(null);
  const [outcome, setOutcome] = useState<"pass" | "fail">("pass");
  const [notes, setNotes] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [completing, setCompleting] = useState(false);

  const handleSchedule = async () => {
    if (!tenancyId || !date || !time) {
      toast.warning("Choose a tenant, date, and time.");
      return;
    }
    setScheduling(true);
    const scheduledFor = new Date(`${date}T${time}`).toISOString();
    const res = await scheduleInspection({ tenancyId, type, scheduledFor });
    setScheduling(false);
    if (res.success) {
      toast.success("Inspection scheduled.");
      setScheduleOpen(false);
      setTenancyId(""); setDate(""); setTime("");
    } else {
      toast.error("Could not schedule inspection", { description: (res as any).error });
    }
  };

  const openComplete = (i: InspectionDto) => {
    setCompleteTarget(i);
    setOutcome("pass");
    setNotes("");
    setDepositAmount("");
  };

  const handleComplete = async () => {
    if (!completeTarget) return;
    setCompleting(true);
    const res = await completeInspection(completeTarget.id, {
      outcome,
      notes: notes || undefined,
      depositResolvedAmount: depositAmount ? Number(depositAmount) : undefined,
    });
    setCompleting(false);
    if (res.success) {
      toast.success(
        completeTarget.type === "move_out"
          ? "Move-out inspection completed. Deposit resolved and tenancy ended - unit is now vacant."
          : "Inspection completed."
      );
      setCompleteTarget(null);
    } else {
      toast.error("Could not complete inspection", { description: (res as any).error });
    }
  };

  const upcoming = inspections.filter((i) => i.status === "scheduled");
  const past = inspections.filter((i) => i.status !== "scheduled");

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inspections</h1>
          <p className="text-sm text-muted-foreground">Move-in, periodic, and move-out inspections.</p>
        </div>
        <Button onClick={() => setScheduleOpen(true)}><Plus className="h-4 w-4 mr-1.5" />Schedule</Button>
      </div>

      {loading && <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <>
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">Upcoming ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing scheduled.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((i) => (
                  <Card key={i.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium">{i.tenancy.unit.property.name} - {i.tenancy.unit.unit_number}</p>
                        <p className="text-sm text-muted-foreground">{i.tenancy.tenant.full_name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{TYPE_LABEL[i.type]}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {i.scheduled_for && new Date(i.scheduled_for).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => openComplete(i)}>
                          <ClipboardCheck className="h-3.5 w-3.5 mr-1.5" />Complete
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => cancelInspection(i.id)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">History ({past.length})</h2>
            {past.length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed or cancelled inspections yet.</p>
            ) : (
              <div className="space-y-2">
                {past.map((i) => (
                  <Card key={i.id}>
                    <CardContent className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-sm">{i.tenancy.unit.property.name} - {i.tenancy.unit.unit_number}</p>
                        <p className="text-xs text-muted-foreground">{i.tenancy.tenant.full_name}</p>
                        {i.notes && <p className="text-xs text-muted-foreground mt-1">"{i.notes}"</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{TYPE_LABEL[i.type]}</Badge>
                        {i.outcome && <Badge variant={i.outcome === "pass" ? "secondary" : "destructive"}>{i.outcome === "pass" ? "Pass" : "Fail"}</Badge>}
                        <Badge variant={STATUS_VARIANT[i.status]}>{i.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Schedule dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Inspection</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tenant</Label>
              <SearchableSelect
                options={activeTenancies.map(t => ({ value: t.tenancyId, label: `${t.tenantName} - ${t.propertyName} (${t.unitNumber})` }))}
                value={tenancyId}
                onChange={setTenancyId}
                placeholder="Select a tenant…"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="move_in">Move-In</SelectItem>
                  <SelectItem value="periodic">Periodic</SelectItem>
                  <SelectItem value="move_out">Move-Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={handleSchedule} disabled={scheduling}>{scheduling ? "Saving…" : "Schedule"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete dialog */}
      <Dialog open={!!completeTarget} onOpenChange={(v) => !v && setCompleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Complete Inspection</DialogTitle></DialogHeader>
          {completeTarget && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {TYPE_LABEL[completeTarget.type]} - {completeTarget.tenancy.tenant.full_name}, {completeTarget.tenancy.unit.property.name} ({completeTarget.tenancy.unit.unit_number})
              </p>
              <div className="space-y-2">
                <Label>Outcome</Label>
                <div className="flex gap-2">
                  <Button type="button" variant={outcome === "pass" ? "default" : "outline"} size="sm" onClick={() => setOutcome("pass")}>Pass</Button>
                  <Button type="button" variant={outcome === "fail" ? "destructive" : "outline"} size="sm" onClick={() => setOutcome("fail")}>Fail</Button>
                </div>
              </div>
              {completeTarget.type === "move_out" && (
                <div className="space-y-2">
                  <Label>Deposit Amount to {outcome === "pass" ? "Return" : "Keep"} (optional)</Label>
                  <Input type="number" step="0.01" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder={outcome === "pass" ? "Leave blank to return the full deposit" : "Leave blank to forfeit nothing"} />
                  <p className="text-xs text-muted-foreground">
                    Completing this will resolve the deposit and end the tenancy - the unit becomes vacant.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  placeholder="Condition of the property, any issues found…" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteTarget(null)}>Cancel</Button>
            <Button onClick={handleComplete} disabled={completing}>{completing ? "Saving…" : "Complete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
