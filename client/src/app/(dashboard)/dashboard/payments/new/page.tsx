"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Mail, MessageCircle, FileText, ExternalLink, CheckCircle2 } from "lucide-react";

import { usePayments, CreatePaymentDto } from "@/hooks/usePayments";
import { useTenants } from "@/hooks/useTenants";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

interface PaymentResult {
  payment: any;
  receipt: any;
}

export default function RecordPaymentPage() {
  const router = useRouter();
  const { createPayment, loading: submitting } = usePayments();
  const { tenants, loading: loadingTenants } = useTenants();

  const activeTenancies = tenants
    .filter((t) => t.activeTenancy)
    .map((t) => ({
      tenantId: t.id,
      tenantName: t.full_name,
      tenancyId: t.activeTenancy!.id,
      unitNumber: t.activeTenancy!.unit.unit_number,
      propertyName: t.activeTenancy!.unit.property.name,
      currency: t.activeTenancy!.currency,
      rentAmount: t.activeTenancy!.rent_amount,
    }));

  const [formData, setFormData] = useState<Partial<CreatePaymentDto>>({
    currency: "USD",
    method: "bank_transfer",
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
    paymentDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [selectedTenancy, setSelectedTenancy] = useState<(typeof activeTenancies)[0] | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifying, setNotifying] = useState(false);

  // Synchronous guard against double-submit - see note in
  // add-property-dialog.tsx for why the `submitting` state alone isn't
  // enough to stop a very fast double-click.
  const isSubmittingRef = useRef(false);

  const handleTenancyChange = (tenancyId: string) => {
    const sel = activeTenancies.find((t) => t.tenancyId === tenancyId);
    if (sel) {
      setSelectedTenancy(sel);
      setFormData({ ...formData, tenancyId, currency: sel.currency, amountPaid: Number(sel.rentAmount) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    if (!formData.tenancyId || !formData.amountPaid) {
      toast.warning("Please select a tenant and enter the amount paid.");
      return;
    }
    isSubmittingRef.current = true;
    try {
      const result = await createPayment(formData as CreatePaymentDto);
      if (result.success) {
        const data = (result as any).data as PaymentResult;
        setPaymentResult(data);
        toast.success("Payment recorded.", { description: `Receipt ${data.receipt?.receipt_number} generated.` });
        // Show owner notification popup
        setNotifyOpen(true);
      } else {
        toast.error("Could not record payment", { description: (result as any).error });
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleNotify = async (channel: "email" | "whatsapp") => {
    if (!paymentResult) return;
    setNotifying(true);
    const owner = paymentResult.payment?.tenancy?.unit?.property?.owner;
    const tenant = paymentResult.payment?.tenancy?.tenant;
    const property = paymentResult.payment?.tenancy?.unit?.property;
    const receipt = paymentResult.receipt;

    const msg = `Dear ${owner?.full_name ?? "Owner"},\n\n${tenant?.full_name ?? "Your tenant"} has paid rent for ${property?.name ?? "the property"} - ${formData.currency} ${formData.amountPaid}. Receipt: ${receipt?.receipt_number}.\n\nRental`;

    if (channel === "whatsapp") {
      const phone = (owner?.phone ?? "").replace(/[^0-9]/g, "");
      if (phone) window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
      else toast.warning("Owner has no phone number on record.");
    } else {
      const res = await apiClient("/communications", {
        method: "POST",
        data: {
          tenantId: tenant?.id,
          channel: "email",
          subject: `Rent Payment Received - ${property?.name}`,
          body: msg,
        },
      });
      if (res.success) toast.success("Email sent to owner.");
      else toast.error("Could not send email", { description: (res as any).error });
    }
    setNotifying(false);
    setNotifyOpen(false);
    router.push(`/dashboard/receipts/${paymentResult.payment?.id}`);
  };

  const skipNotify = () => {
    setNotifyOpen(false);
    if (paymentResult) router.push(`/dashboard/receipts/${paymentResult.payment?.id}`);
    else router.push("/dashboard/payments");
  };

  const owner = paymentResult?.payment?.tenancy?.unit?.property?.owner;
  const tenant = paymentResult?.payment?.tenancy?.tenant;
  const property = paymentResult?.payment?.tenancy?.unit?.property;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Link href="/dashboard/payments" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />Back to Payments
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Record Payment</CardTitle>
          <CardDescription>Enter payment details to generate a receipt.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tenant / Property <span className="text-destructive">*</span></Label>
  <SearchableSelect
                disabled={loadingTenants}
                value={formData.tenancyId ?? ""}
                onChange={handleTenancyChange}
                placeholder={loadingTenants ? "Loading tenants…" : "Search by tenant or property…"}
                searchPlaceholder="Type tenant name or property…"
                options={activeTenancies.map(t => ({
                  value: t.tenancyId,
                  label: t.tenantName,
                  sublabel: `${t.propertyName} · ${t.unitNumber} · ${t.currency} ${Number(t.rentAmount).toLocaleString()}/mo`,
                }))}
              />
              {selectedTenancy && (
                <p className="text-xs text-muted-foreground">
                  Rent: {selectedTenancy.currency} {Number(selectedTenancy.rentAmount).toLocaleString()}/mo
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Period Month</Label>
                <Input type="number" min={1} max={12} value={formData.periodMonth}
                  onChange={(e) => setFormData({ ...formData, periodMonth: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label>Period Year</Label>
                <Input type="number" min={2000} value={formData.periodYear}
                  onChange={(e) => setFormData({ ...formData, periodYear: Number(e.target.value) })} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount Paid <span className="text-destructive">*</span></Label>
                <Input type="number" step="0.01" value={formData.amountPaid ?? ""}
                  onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="ZiG">ZiG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.currency === "ZiG" && (
              <div className="space-y-2">
                <Label>ZiG to USD Rate</Label>
                <Input type="number" step="0.01" value={formData.zigUsdRate ?? ""}
                  onChange={(e) => setFormData({ ...formData, zigUsdRate: Number(e.target.value) })} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={formData.method} onValueChange={(v) => setFormData({ ...formData, method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="ecocash">EcoCash</SelectItem>
                    <SelectItem value="innbucks">InnBucks</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reference</Label>
                <Input value={formData.reference ?? ""}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="Optional" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Date <span className="text-destructive">*</span></Label>
              <Input type="date" value={formData.paymentDate ?? ""}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })} required />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={submitting || !formData.tenancyId}>
                {submitting ? "Saving…" : "Record Payment & Generate Receipt"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Owner notification popup */}
      <Dialog open={notifyOpen} onOpenChange={(v) => { if (!v) skipNotify(); }}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Payment Recorded
            </DialogTitle>
            <DialogDescription>
              {tenant?.full_name ?? "Tenant"} paid {formData.currency} {formData.amountPaid?.toLocaleString()} for{" "}
              <strong>{property?.name}</strong>. Receipt generated.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm space-y-1">
            <p><span className="text-muted-foreground">Owner:</span> <strong>{owner?.full_name ?? "-"}</strong></p>
            <p><span className="text-muted-foreground">Email:</span> {owner?.email ?? "Not on record"}</p>
            <p><span className="text-muted-foreground">Phone:</span> {owner?.phone ?? "Not on record"}</p>
          </div>

          <p className="text-sm text-muted-foreground">
            Would you like to notify the owner now?
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => handleNotify("email")} disabled={notifying || !owner?.email}>
              <Mail className="mr-2 h-4 w-4" />Send Email
            </Button>
            <Button variant="outline" onClick={() => handleNotify("whatsapp")} disabled={notifying || !owner?.phone}>
              <MessageCircle className="mr-2 h-4 w-4 text-green-600" />WhatsApp
            </Button>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {paymentResult && (
              <Button variant="secondary" asChild>
                <Link href={`/dashboard/receipts/${paymentResult.payment?.id}`} target="_blank">
                  <FileText className="mr-2 h-4 w-4" />View Receipt
                </Link>
              </Button>
            )}
            <Button onClick={skipNotify} variant="ghost">Skip for now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
