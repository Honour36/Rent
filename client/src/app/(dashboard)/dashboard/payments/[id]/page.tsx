"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, FileText, Mail, MessageCircle, Pencil, Trash2, Loader2 } from "@/components/icons";
import { toast } from "sonner";
import Link from "next/link";

import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function statusBadge(status: string) {
  switch (status) {
    case 'paid':    return <Badge className="bg-green-600">Paid</Badge>;
    case 'partial': return <Badge className="bg-amber-500 text-white">Partial</Badge>;
    case 'late':    return <Badge variant="destructive">Late</Badge>;
    default:        return <Badge variant="outline">{status}</Badge>;
  }
}

interface PageProps { params: Promise<{ id: string }> }

export default function PaymentDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient<any>(`/payments/${id}`)
      .then(res => { if (res.success) setPayment((res as any).data); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await apiClient(`/payments/${id}`, { method: 'DELETE' });
    if (res.success) { toast.success('Payment deleted.'); router.push('/dashboard/payments'); }
    else { toast.error('Could not delete', { description: (res as any).error }); setDeleting(false); }
    setShowDelete(false);
  };

  const handleViewPdf = async () => {
    setPdfLoading(true);
    const res = await apiClient<{ url: string }>(`/receipts/${id}/signed-url`);
    setPdfLoading(false);
    if (res.success) {
      window.open((res as any).data.url, '_blank');
    } else if ((res as any).code === 'ACCOUNT_DETAILS_INCOMPLETE') {
      toast.error('Account details incomplete', {
        description: 'Fill in your address, phone, and email in Settings before printing.',
        duration: 8000,
        action: { label: 'Go to Settings', onClick: () => router.push('/dashboard/settings?tab=account') },
      });
    } else {
      // Fallback: stream directly
      window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/receipts/${id}/pdf`, '_blank');
    }
  };

  const handleSendEmail = async () => {
    const res = await apiClient(`/receipts/${id}/send`, { method: 'POST', data: { channel: 'email' } });
    if (res.success) toast.success('Receipt emailed to tenant.');
    else toast.error('Could not send email', { description: (res as any).error });
  };

  const handleWhatsApp = () => {
    const phone = payment?.tenancy?.tenant?.phone?.replace(/[^0-9]/g, '');
    const receiptNo = payment?.receipts?.[0]?.receipt_number ?? 'N/A';
    if (!phone) { toast.warning('Tenant has no phone number on record.'); return; }
    const msg = `Dear ${payment?.tenancy?.tenant?.full_name}, your rent payment receipt ${receiptNo} for ${payment?.tenancy?.unit?.property?.name} is ready. Thank you!`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
  if (!payment) return (
    <div className="flex h-[50vh] items-center justify-center flex-col gap-3">
      <p className="text-sm text-muted-foreground">Payment not found.</p>
      <Button variant="outline" onClick={() => router.push('/dashboard/payments')}>Back</Button>
    </div>
  );

  const tenant = payment.tenancy?.tenant;
  const unit   = payment.tenancy?.unit;
  const prop   = unit?.property;
  const receipt = payment.receipts?.[0];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/payments')}>
          <ArrowLeft className="mr-2 h-4 w-4" />Payments
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleViewPdf} disabled={pdfLoading}>
            {pdfLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            View / Print Receipt
          </Button>
          <Button variant="outline" size="sm" onClick={handleSendEmail}>
            <Mail className="mr-2 h-4 w-4" />Email Receipt
          </Button>
          <Button variant="outline" size="sm" onClick={handleWhatsApp}>
            <MessageCircle className="mr-2 h-4 w-4 text-green-600" />WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowDelete(true)}
            className="text-destructive border-destructive/40 hover:bg-destructive/10">
            <Trash2 className="mr-2 h-4 w-4" />Delete
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Details</h1>
          {receipt && <p className="text-sm text-muted-foreground">Receipt: {receipt.receipt_number}</p>}
        </div>
        {statusBadge(payment.status)}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Tenant</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-semibold text-base">{tenant?.full_name ?? '-'}</p>
            <p className="text-muted-foreground">{tenant?.email ?? '-'}</p>
            <p className="text-muted-foreground">{tenant?.phone ?? '-'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Property</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-semibold text-base">{prop?.name ?? '-'}</p>
            <p className="text-muted-foreground">Unit: {unit?.unit_number ?? '-'}</p>
            <p className="text-muted-foreground">Owner: {prop?.owner?.full_name ?? '-'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Payment</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold text-lg">{payment.currency} {Number(payment.amount_paid).toLocaleString('en-ZW', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Period</span>
              <span>{payment.period_month}/{payment.period_year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date Paid</span>
              <span>{format(new Date(payment.payment_date), 'dd MMM yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="capitalize">{payment.method.replace('_', ' ')}</span>
            </div>
            {payment.reference && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span>{payment.reference}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Receipt</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {receipt ? (
              <>
                <p className="text-sm font-mono">{receipt.receipt_number}</p>
                <Button className="w-full" onClick={handleViewPdf} disabled={pdfLoading}>
                  {pdfLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  View PDF Receipt
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No receipt generated yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Delete this payment of <strong>{payment.currency} {Number(payment.amount_paid).toLocaleString()}</strong> for {tenant?.full_name}?
              The receipt will also be removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
