'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useReceipts } from '../_hooks/useReceipts';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, MessageCircle, ArrowLeft } from 'lucide-react';

export default function ReceiptPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { id: paymentId } = params as { id: string };
  const { getReceipt, sendReceipt, loading } = useReceipts();
  
  const [receipt, setReceipt] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<'email' | 'whatsapp' | null>(null);

  useEffect(() => {
    if (paymentId) {
      getReceipt(paymentId).then(data => {
        if (data) setReceipt(data);
      });
    }
  }, [paymentId, getReceipt]);

  const handleSendEmail = async () => {
    setActionLoading('email');
    await sendReceipt(paymentId, 'email');
    setActionLoading(null);
    alert('Receipt sent via Email successfully!');
    // Refresh receipt data to show updated sent_via array if needed
    const data = await getReceipt(paymentId);
    if (data) setReceipt(data);
  };

  const handleSendWhatsApp = async () => {
    setActionLoading('whatsapp');
    await sendReceipt(paymentId, 'whatsapp');
    
    if (receipt?.payment?.tenancy?.tenant?.phone) {
      const phone = receipt.payment.tenancy.tenant.phone.replace(/[^0-9]/g, '');
      const message = `Hello ${receipt.payment.tenancy.tenant.full_name}, your rent payment receipt (${receipt.receipt_number}) is ready. Thank you!`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      alert('Tenant does not have a phone number on file.');
    }
    
    setActionLoading(null);
    const data = await getReceipt(paymentId);
    if (data) setReceipt(data);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Receipt Preview</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleSendWhatsApp} 
            disabled={!receipt || loading || actionLoading !== null}
          >
            {actionLoading === 'whatsapp' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageCircle className="mr-2 h-4 w-4 text-green-600" />}
            WhatsApp
          </Button>
          <Button 
            onClick={handleSendEmail} 
            disabled={!receipt || loading || actionLoading !== null}
          >
            {actionLoading === 'email' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
            Email Receipt
          </Button>
        </div>
      </div>

      <div className="rounded-md border h-[700px] overflow-hidden bg-muted/20 relative">
        {loading && !receipt && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {receipt && (
          <iframe 
            src={`/api/receipts/${paymentId}/pdf`} 
            className="w-full h-full border-0" 
            title="Receipt PDF Preview"
          />
        )}
      </div>
    </div>
  );
}
