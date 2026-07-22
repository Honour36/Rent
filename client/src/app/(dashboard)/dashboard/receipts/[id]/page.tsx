'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { useReceipts } from '../_hooks/useReceipts';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, MessageCircle, ArrowLeft, Printer, ExternalLink } from "@/components/icons";

export default function ReceiptPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { id: paymentId } = params as { id: string };
  const { getReceipt, sendReceipt, getSignedUrl, loading } = useReceipts();

  const [receipt, setReceipt] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<'email' | 'whatsapp' | 'pdf' | null>(null);

  useEffect(() => {
    if (!paymentId) return;
    getReceipt(paymentId).then(data => {
      if (data) setReceipt(data);
    });
    // Fetch signed URL for the PDF stored in bucket
    getSignedUrl(paymentId).then(url => {
      if (url) setPdfUrl(url);
    });
  }, [paymentId]);

  const handleSendEmail = async () => {
    setActionLoading('email');
    await sendReceipt(paymentId, 'email');
    setActionLoading(null);
  };

  const handleSendWhatsApp = async () => {
    setActionLoading('whatsapp');
    await sendReceipt(paymentId, 'whatsapp');
    if (receipt?.payment?.tenancy?.tenant?.phone) {
      const phone = receipt.payment.tenancy.tenant.phone.replace(/[^0-9]/g, '');
      const msg = `Hello ${receipt.payment.tenancy.tenant.full_name}, your rent payment receipt (${receipt.receipt_number}) is ready. Thank you!`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    }
    setActionLoading(null);
    const data = await getReceipt(paymentId);
    if (data) setReceipt(data);
  };

  const handlePrint = async () => {
    setActionLoading('pdf');
    const res = await getSignedUrl(paymentId);
    setActionLoading(null);
    if (typeof res === 'string') {
      window.open(res, '_blank');
    } else if ((res as any)?.code === 'ACCOUNT_DETAILS_INCOMPLETE' || !res) {
      toast.error('Complete your account details first', {
        description: 'Go to Settings → Account and fill in your address, phone, and email before printing a receipt.',
        duration: 8000,
        action: { label: 'Go to Settings', onClick: () => window.location.assign('/dashboard/settings?tab=account') },
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Receipt Preview</h2>
            {receipt?.receipt_number && (
              <p className="text-sm text-muted-foreground mt-0.5">{receipt.receipt_number}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={!receipt || actionLoading !== null}
          >
            {actionLoading === 'pdf'
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <Printer className="mr-2 h-4 w-4" />}
            Print / Download
          </Button>
          <Button
            variant="outline"
            onClick={handleSendWhatsApp}
            disabled={!receipt || loading || actionLoading !== null}
          >
            {actionLoading === 'whatsapp'
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <MessageCircle className="mr-2 h-4 w-4 text-green-600" />}
            WhatsApp
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={!receipt || loading || actionLoading !== null}
          >
            {actionLoading === 'email'
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <Mail className="mr-2 h-4 w-4" />}
            Email Receipt
          </Button>
        </div>
      </div>

      <div className="rounded-md border h-[700px] overflow-hidden bg-muted/20 relative">
        {(loading || (!pdfUrl && !receipt)) && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title="Receipt PDF Preview"
          />
        )}
        {!pdfUrl && receipt && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-muted-foreground">PDF is being prepared…</p>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <ExternalLink className="mr-2 h-4 w-4" /> Open PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
