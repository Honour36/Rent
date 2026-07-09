"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Pencil, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { PaymentDto } from '@/hooks/usePayments';
import { apiClient } from '@/lib/api-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function statusBadge(status: string) {
  switch (status) {
    case 'paid':    return <Badge className="bg-green-600 hover:bg-green-700">Paid</Badge>;
    case 'partial': return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Partial</Badge>;
    case 'late':    return <Badge variant="destructive">Late</Badge>;
    default:        return <Badge variant="outline">{status}</Badge>;
  }
}

function EditPaymentDialog({ payment, onClose, onSaved }: { payment: PaymentDto; onClose: () => void; onSaved: () => void }) {
  const [amount, setAmount] = useState(String(payment.amount_paid));
  const [method, setMethod] = useState(payment.method);
  const [reference, setReference] = useState(payment.reference ?? '');
  const [date, setDate] = useState(payment.payment_date.slice(0, 10));
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    const res = await apiClient(`/payments/${payment.id}`, {
      method: 'PATCH',
      data: { amountPaid: Number(amount), method, reference, paymentDate: date },
    });
    setLoading(false);
    if (res.success) { toast.success('Payment updated.'); onSaved(); onClose(); }
    else toast.error('Could not update payment', { description: (res as any).error });
  };

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader><DialogTitle>Edit Payment</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-1.5">
            <Label>Amount Paid ({payment.currency})</Label>
            <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['cash','bank_transfer','ecocash','innbucks','other'].map(m => (
                  <SelectItem key={m} value={m}>{m.replace('_',' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Reference</Label>
            <Input value={reference} onChange={e => setReference(e.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-1.5">
            <Label>Payment Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PaymentListTable({ payments, onRefresh }: { payments: PaymentDto[]; onRefresh?: () => void }) {
  const router = useRouter();
  const [editPayment, setEditPayment] = useState<PaymentDto | null>(null);
  const [deletePayment, setDeletePayment] = useState<PaymentDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletePayment) return;
    setDeleting(true);
    const res = await apiClient(`/payments/${deletePayment.id}`, { method: 'DELETE' });
    if (res.success) { toast.success('Payment deleted.'); onRefresh?.(); }
    else toast.error('Could not delete', { description: (res as any).error });
    setDeletePayment(null);
    setDeleting(false);
  };

  if (!payments || payments.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-md">
        No payments found.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Property / Unit</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/dashboard/payments/${p.id}`)}>
                <TableCell>{format(new Date(p.payment_date), 'dd MMM yyyy')}</TableCell>
                <TableCell className="font-medium">{p.tenancy?.tenant?.full_name ?? '—'}</TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span>{p.tenancy?.unit?.property?.name ?? '—'}</span>
                    <span className="text-muted-foreground">{p.tenancy?.unit?.unit_number}</span>
                  </div>
                </TableCell>
                <TableCell>{p.period_month}/{p.period_year}</TableCell>
                <TableCell className="capitalize">{p.method.replace('_', ' ')}</TableCell>
                <TableCell className="text-right font-medium">
                  {p.currency} {Number(p.amount_paid).toLocaleString('en-ZW', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-center">{statusBadge(p.status)}</TableCell>
                <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="View Receipt"
                      onClick={() => router.push(`/dashboard/receipts/${p.id}`)}>
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => setEditPayment(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeletePayment(p)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editPayment && (
        <EditPaymentDialog
          payment={editPayment}
          onClose={() => setEditPayment(null)}
          onSaved={() => { setEditPayment(null); onRefresh?.(); }}
        />
      )}

      <AlertDialog open={!!deletePayment} onOpenChange={(v) => { if (!v) setDeletePayment(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Delete this payment of <strong>{deletePayment?.currency} {Number(deletePayment?.amount_paid).toLocaleString()}</strong>?
              The associated receipt will also be removed. This cannot be undone.
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
    </>
  );
}
