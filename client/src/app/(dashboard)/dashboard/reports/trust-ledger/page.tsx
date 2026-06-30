"use client";

import { useEffect, useState } from "react";
import { useReports, TrustLedgerReportItem } from "@/hooks/useReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function TrustLedgerReportPage() {
  const { getTrustLedgerReport, loading, error } = useReports();
  const [data, setData] = useState<TrustLedgerReportItem[]>([]);

  useEffect(() => {
    getTrustLedgerReport().then(setData);
  }, [getTrustLedgerReport]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trust Account Ledger</h1>
        <p className="text-muted-foreground mt-2">Log of all trust transactions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Tenant / Unit</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
                ) : data.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No transactions found.</TableCell></TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.transactionId}>
                      <TableCell>{format(new Date(item.date), "dd MMM yyyy")}</TableCell>
                      <TableCell className="capitalize">{item.type.replace('_', ' ')}</TableCell>
                      <TableCell>{item.ownerName}</TableCell>
                      <TableCell>{item.tenantName} (Unit {item.unitNumber})</TableCell>
                      <TableCell>{item.description || '-'}</TableCell>
                      <TableCell className={`text-right font-mono ${item.type.includes('release') || item.type.includes('deduction') ? 'text-red-500' : 'text-green-500'}`}>
                        {item.type.includes('release') || item.type.includes('deduction') ? '-' : '+'}{item.currency === 'USD' ? '$' : 'ZiG '}{item.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}