"use client";

import { useEffect, useState } from "react";
import { useReports, LeaseExpiryReportItem } from "@/hooks/useReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function LeaseExpiryReportPage() {
  const { getLeaseExpiryReport, loading, error } = useReports();
  const [data, setData] = useState<LeaseExpiryReportItem[]>([]);
  const [days, setDays] = useState("30");

  useEffect(() => {
    getLeaseExpiryReport(parseInt(days)).then(setData);
  }, [getLeaseExpiryReport, days]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lease Expiry Report</h1>
          <p className="text-muted-foreground mt-2">Tenancies expiring soon.</p>
        </div>
        <div className="w-[180px]">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger>
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Next 30 Days</SelectItem>
              <SelectItem value="60">Next 60 Days</SelectItem>
              <SelectItem value="90">Next 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expiring Leases</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property / Unit</TableHead>
                  <TableHead>Rent Amount</TableHead>
                  <TableHead>Expiry Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                ) : data.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No leases expiring in the next {days} days.</TableCell></TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.tenancyId}>
                      <TableCell className="font-medium">{item.tenantName}</TableCell>
                      <TableCell>{item.propertyName}, Unit {item.unitNumber}</TableCell>
                      <TableCell className="font-mono">{item.currency === 'USD' ? '$' : 'ZiG '}{item.rentAmount.toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(item.leaseEnd), "dd MMM yyyy")}</TableCell>
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