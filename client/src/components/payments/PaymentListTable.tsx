import React from 'react';
import { PaymentDto } from '@/hooks/usePayments';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export function PaymentListTable({ payments }: { payments: PaymentDto[] }) {
  if (!payments || payments.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-md">
        No payments found matching the selected filters.
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge variant="default" className="bg-green-600">Paid</Badge>;
      case 'partial': return <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600">Partial</Badge>;
      case 'late': return <Badge variant="destructive">Late</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{format(new Date(p.payment_date), 'MMM d, yyyy')}</TableCell>
              <TableCell>{p.tenancy?.tenant?.full_name || 'Unknown'}</TableCell>
              <TableCell>
                {p.tenancy?.unit?.unit_number} {p.tenancy?.unit?.property?.name}
              </TableCell>
              <TableCell>{p.period_month}/{p.period_year}</TableCell>
              <TableCell className="capitalize">{p.method.replace('_', ' ')}</TableCell>
              <TableCell className="text-right font-medium">
                {p.currency} {Number(p.amount_paid).toFixed(2)}
              </TableCell>
              <TableCell className="text-center">
                {getStatusBadge(p.status)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
