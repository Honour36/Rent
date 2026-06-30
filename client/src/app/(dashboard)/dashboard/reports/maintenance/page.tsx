"use client";

import { useEffect, useState } from "react";
import { useReports, MaintenanceReportItem } from "@/hooks/useReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function MaintenanceReportPage() {
  const { getMaintenanceReport, loading, error } = useReports();
  const [data, setData] = useState<MaintenanceReportItem[]>([]);

  useEffect(() => {
    getMaintenanceReport().then(setData);
  }, [getMaintenanceReport]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Maintenance Report</h1>
        <p className="text-muted-foreground mt-2">Log of maintenance requests, costs, and resolution times.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Log</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logged</TableHead>
                  <TableHead>Property / Unit</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Resolution Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
                ) : data.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No maintenance records found.</TableCell></TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.requestId}>
                      <TableCell>{format(new Date(item.loggedDate), "dd MMM yy")}</TableCell>
                      <TableCell>{item.propertyName}, Unit {item.unitNumber}</TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'resolved' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">${item.cost.toFixed(2)}</TableCell>
                      <TableCell>
                        {item.resolutionTime !== null ? `${item.resolutionTime} days` : '-'}
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