"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePayments, CreatePaymentDto } from "@/hooks/usePayments";
import { useTenants } from "@/hooks/useTenants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function RecordPaymentPage() {
  const router = useRouter();
  const { createPayment, loading: submitting } = usePayments();
  const { tenants, loading: loadingTenants } = useTenants();
  const [error, setError] = useState("");

  const activeTenancies = tenants
    .filter(t => t.activeTenancy)
    .map(t => ({
      tenantId: t.id,
      tenantName: t.full_name,
      tenancyId: t.activeTenancy!.id,
      unitNumber: t.activeTenancy!.unit.unit_number,
      propertyName: t.activeTenancy!.unit.property.name,
      currency: t.activeTenancy!.currency,
      rentAmount: t.activeTenancy!.rent_amount,
    }));

  const [formData, setFormData] = useState<Partial<CreatePaymentDto>>({
    currency: 'USD',
    method: 'bank_transfer',
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleTenancyChange = (tenancyId: string) => {
    const selected = activeTenancies.find(t => t.tenancyId === tenancyId);
    if (selected) {
      setFormData({
        ...formData,
        tenancyId,
        currency: selected.currency,
        amountPaid: Number(selected.rentAmount),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.tenancyId || !formData.amountPaid || !formData.periodMonth || !formData.periodYear || !formData.paymentDate) {
      setError("Please fill all required fields");
      return;
    }

    const result = await createPayment(formData as CreatePaymentDto);
    if (result.success) {
      router.push("/payments");
      router.refresh();
    } else {
      setError(result.error || "Failed to record payment");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Link href="/payments" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Payments
      </Link>
      
      <Card>
        <CardHeader>
          <CardTitle>Record Payment</CardTitle>
          <CardDescription>Enter payment details to generate a receipt.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 p-3 bg-destructive/15 text-destructive text-sm rounded-md">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tenancy</Label>
              <Select disabled={loadingTenants} onValueChange={handleTenancyChange} value={formData.tenancyId || ""}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingTenants ? "Loading..." : "Select tenant or property"} />
                </SelectTrigger>
                <SelectContent>
                  {activeTenancies.map(t => (
                    <SelectItem key={t.tenancyId} value={t.tenancyId}>
                      {t.tenantName} - {t.unitNumber} {t.propertyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Period Month (1-12)</Label>
                <Input type="number" min={1} max={12} value={formData.periodMonth} onChange={e => setFormData({ ...formData, periodMonth: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label>Period Year</Label>
                <Input type="number" min={2000} value={formData.periodYear} onChange={e => setFormData({ ...formData, periodYear: Number(e.target.value) })} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount Paid</Label>
                <Input type="number" step="0.01" value={formData.amountPaid || ""} onChange={e => setFormData({ ...formData, amountPaid: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={formData.currency} onValueChange={v => setFormData({ ...formData, currency: v })}>
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
                <Input type="number" step="0.01" value={formData.zigUsdRate || ""} onChange={e => setFormData({ ...formData, zigUsdRate: Number(e.target.value) })} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={formData.method} onValueChange={v => setFormData({ ...formData, method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="ecocash">EcoCash</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reference (Optional)</Label>
                <Input value={formData.reference || ""} onChange={e => setFormData({ ...formData, reference: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input type="date" value={formData.paymentDate || ""} onChange={e => setFormData({ ...formData, paymentDate: e.target.value })} required />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={submitting || !formData.tenancyId}>
                {submitting ? "Saving..." : "Record Payment & Generate Receipt"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
