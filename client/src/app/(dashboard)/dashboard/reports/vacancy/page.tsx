"use client";

import { useEffect, useState } from "react";
import { useReports, VacancyReportItem } from "@/hooks/useReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function VacancyReportPage() {
  const { getVacancyReport, loading, error } = useReports();
  const [data, setData] = useState<VacancyReportItem[]>([]);

  useEffect(() => {
    getVacancyReport().then(setData);
  }, [getVacancyReport]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vacancy Report</h1>
        <p className="text-muted-foreground mt-2">Currently vacant units.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vacant Units</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Unit Number</TableHead>
                  <TableHead>Rent Amount</TableHead>
                  <TableHead>Days Vacant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                ) : data.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No vacant units.</TableCell></TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.unitId}>
                      <TableCell className="font-medium">{item.propertyName}</TableCell>
                      <TableCell>{item.unitNumber}</TableCell>
                      <TableCell className="font-mono">{item.currency === 'USD' ? '$' : 'ZiG '}{item.rentAmount.toFixed(2)}</TableCell>
                      <TableCell>{item.daysVacant} days</TableCell>
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