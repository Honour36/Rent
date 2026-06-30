"use client";

import { useEffect, useState } from "react";
import { useReports, CollectionRateReportItem } from "@/hooks/useReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export default function CollectionRateReportPage() {
  const { getCollectionRateReport, loading, error } = useReports();
  const [data, setData] = useState<CollectionRateReportItem[]>([]);

  useEffect(() => {
    getCollectionRateReport().then(setData);
  }, [getCollectionRateReport]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Collection Rate</h1>
        <p className="text-muted-foreground mt-2">Monthly rent collection percentage over the last 6 months.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collection Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Collected</TableHead>
                  <TableHead className="w-[200px]">Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                ) : data.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No data available.</TableCell></TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={`${item.year}-${item.month}`}>
                      <TableCell className="font-medium">{monthNames[item.month - 1]} {item.year}</TableCell>
                      <TableCell className="font-mono">${item.due.toFixed(2)}</TableCell>
                      <TableCell className="font-mono">${item.collected.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={item.rate} className="h-2 flex-1" />
                          <span className="text-xs w-8 font-medium">{item.rate.toFixed(0)}%</span>
                        </div>
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