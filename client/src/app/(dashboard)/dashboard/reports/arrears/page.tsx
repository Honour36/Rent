"use client";

import { useEffect, useState } from "react";
import { useReports, ArrearsReportItem } from "@/hooks/useReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ArrearsReportPage() {
  const { getArrearsReport, loading, error } = useReports();
  const [data, setData] = useState<ArrearsReportItem[]>([]);

  useEffect(() => {
    getArrearsReport().then(setData);
  }, [getArrearsReport]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Arrears Report</h1>
        <p className="text-muted-foreground mt-2">Tenancies with outstanding balances.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Outstanding Balances</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property / Unit</TableHead>
                  <TableHead>Amount Owed</TableHead>
                  <TableHead>Days Overdue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                ) : data.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No arrears found.</TableCell></TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.tenancyId}>
                      <TableCell className="font-medium">{item.tenantName}</TableCell>
                      <TableCell>{item.propertyName}, Unit {item.unitNumber}</TableCell>
                      <TableCell className="font-mono">{item.currency === 'USD' ? '$' : 'ZiG '}{item.amountOwed.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{item.daysOverdue} days</Badge>
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