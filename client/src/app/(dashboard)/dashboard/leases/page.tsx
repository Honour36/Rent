"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileCheck, Loader2, Plus, AlertTriangle } from "@/components/icons";

import { useLeaseLifecycle } from "@/hooks/useLeaseLifecycle";
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

const REASON_LABEL: Record<string, string> = {
  eviction: "Eviction",
  sale: "Property Sale",
  tenant_request: "Tenant Request",
  other: "Other",
};
const NOTICE_STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  active: "destructive",
  withdrawn: "outline",
  fulfilled: "secondary",
};

export default function LeasesPage() {
  const { renewals, notices, loading, error, createRenewal, createNotice, withdrawNotice } = useLeaseLifecycle();
  const { tenants } = useTenants();

  const activeTenancies = tenants
    .filter((t) => t.activeTenancy)
    .map((t) => ({
      tenancyId: t.activeTenancy!.id,
      tenantName: t.full_name,
      unitNumber: t.activeTenancy!.unit.unit_number,
      propertyName: t.activeTenancy!.unit.property.name,
    }));

  // Renewal dialog
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewTenancyId, setRenewTenancyId] = useState("");
  const [newLeaseEnd, setNewLeaseEnd] = useState("");
  const [leaseFee, setLeaseFee] = useState("");
  const [renewNotes, setRenewNotes] = useState("");
  const [renewing, setRenewing] = useState(false);

  // Notice dialog
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [noticeTenancyId, setNoticeTenancyId] = useState("");
  const [reason, setReason] = useState<"eviction" | "sale" | "tenant_request" | "other">("tenant_request");
  const [noticeDate, setNoticeDate] = useState("");
  const [vacateBy, setVacateBy] = useState("");
  const [noticeNotes, setNoticeNotes] = useState("");
  const [issuingNotice, setIssuingNotice] = useState(false);

  const handleRenew = async () => {
    if (!renewTenancyId || !newLeaseEnd) {
      toast.warning("Choose a tenant and a new lease end date.");
      return;
    }
    setRenewing(true);
    const res = await createRenewal({
      tenancyId: renewTenancyId,
      newLeaseEnd,
      leaseFeeAmount: leaseFee ? Number(leaseFee) : undefined,
      notes: renewNotes || undefined,
    });
    setRenewing(false);
    if (res.success) {
      toast.success("Lease renewed.");
      setRenewOpen(false);
      setRenewTenancyId(""); setNewLeaseEnd(""); setLeaseFee(""); setRenewNotes("");
    } else {
      toast.error("Could not renew lease", { description: (res as any).error });
    }
  };

  const handleIssueNotice = async () => {
    if (!noticeTenancyId || !noticeDate || !vacateBy) {
      toast.warning("Choose a tenant, notice date, and vacate-by date.");
      return;
    }
    setIssuingNotice(true);
    const res = await createNotice({ tenancyId: noticeTenancyId, reason, noticeDate, vacateBy, notes: noticeNotes || undefined });
    setIssuingNotice(false);
    if (res.success) {
      toast.success("Notice issued.");
      setNoticeOpen(false);
      setNoticeTenancyId(""); setNoticeDate(""); setVacateBy(""); setNoticeNotes("");
    } else {
      toast.error("Could not issue notice", { description: (res as any).error });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Leases</h1>
        <p className="text-sm text-muted-foreground">Renewals and notices to vacate.</p>
      </div>

      {loading && <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-muted-foreground">Notices to Vacate</h2>
              <Button size="sm" variant="outline" onClick={() => setNoticeOpen(true)}><Plus className="h-3.5 w-3.5 mr-1.5" />Issue Notice</Button>
            </div>
            {notices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notices issued.</p>
            ) : (
              <div className="space-y-2">
                {notices.map((n) => (
                  <Card key={n.id}>
                    <CardContent className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-sm">{n.tenancy.unit.property.name} - {n.tenancy.unit.unit_number}</p>
                        <p className="text-xs text-muted-foreground">{n.tenancy.tenant.full_name} - {REASON_LABEL[n.reason]}</p>
                        <p className="text-xs text-muted-foreground">Vacate by {new Date(n.vacate_by).toLocaleDateString("en-GB", { dateStyle: "medium" })}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={NOTICE_STATUS_VARIANT[n.status]}>{n.status}</Badge>
                        {n.status === "active" && (
                          <Button size="sm" variant="ghost" onClick={() => withdrawNotice(n.id)}>Withdraw</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-muted-foreground">Lease Renewals</h2>
              <Button size="sm" variant="outline" onClick={() => setRenewOpen(true)}><Plus className="h-3.5 w-3.5 mr-1.5" />Renew Lease</Button>
            </div>
            {renewals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No renewals recorded.</p>
            ) : (
              <div className="space-y-2">
                {renewals.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-sm">{r.tenancy.unit.property.name} - {r.tenancy.unit.unit_number}</p>
                        <p className="text-xs text-muted-foreground">{r.tenancy.tenant.full_name}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="flex items-center gap-1.5 justify-end"><FileCheck className="h-3.5 w-3.5" /> Until {new Date(r.new_lease_end).toLocaleDateString("en-GB", { dateStyle: "medium" })}</p>
                        {r.lease_fee_amount != null && (
                          <p className="text-xs text-muted-foreground">Fee: {r.currency} {Number(r.lease_fee_amount).toLocaleString()}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Renew dialog */}
      <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Renew Lease</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tenant</Label>
              <SearchableSelect
                options={activeTenancies.map(t => ({ value: t.tenancyId, label: `${t.tenantName} - ${t.propertyName} (${t.unitNumber})` }))}
                value={renewTenancyId}
                onChange={setRenewTenancyId}
                placeholder="Select a tenant…"
              />
            </div>
            <div className="space-y-2">
              <Label>New Lease End Date</Label>
              <Input type="date" value={newLeaseEnd} onChange={(e) => setNewLeaseEnd(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Lease Fee (optional)</Label>
              <Input type="number" step="0.01" value={leaseFee} onChange={(e) => setLeaseFee(e.target.value)} placeholder="Amount, if one applies" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={renewNotes} onChange={(e) => setRenewNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewOpen(false)}>Cancel</Button>
            <Button onClick={handleRenew} disabled={renewing}>{renewing ? "Saving…" : "Renew"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notice dialog */}
      <Dialog open={noticeOpen} onOpenChange={setNoticeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Issue Notice to Vacate</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tenant</Label>
              <SearchableSelect
                options={activeTenancies.map(t => ({ value: t.tenancyId, label: `${t.tenantName} - ${t.propertyName} (${t.unitNumber})` }))}
                value={noticeTenancyId}
                onChange={setNoticeTenancyId}
                placeholder="Select a tenant…"
              />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={(v) => setReason(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="eviction">Eviction</SelectItem>
                  <SelectItem value="sale">Property Sale</SelectItem>
                  <SelectItem value="tenant_request">Tenant Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Notice Date</Label>
                <Input type="date" value={noticeDate} onChange={(e) => setNoticeDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Vacate By</Label>
                <Input type="date" value={vacateBy} onChange={(e) => setVacateBy(e.target.value)} />
              </div>
            </div>
            {reason === "sale" && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> A sale typically entitles the tenant to 3 months' notice - choose the vacate-by date accordingly.
              </p>
            )}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={noticeNotes} onChange={(e) => setNoticeNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoticeOpen(false)}>Cancel</Button>
            <Button onClick={handleIssueNotice} disabled={issuingNotice}>{issuingNotice ? "Saving…" : "Issue Notice"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
