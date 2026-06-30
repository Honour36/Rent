const fs = require('fs');
const path = require('path');

const basePath = "e:\\Coding\\Rent\\client\\src\\app\\(dashboard)\\dashboard\\reports";

const templates = {
  "arrears": `
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
  `,
  "vacancy": `
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
  `,
  "lease-expiry": `
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
  `,
  "collection-rate": `
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
                    <TableRow key={\`\${item.year}-\${item.month}\`}>
                      <TableCell className="font-medium">{monthNames[item.month - 1]} {item.year}</TableCell>
                      <TableCell className="font-mono">\${item.due.toFixed(2)}</TableCell>
                      <TableCell className="font-mono">\${item.collected.toFixed(2)}</TableCell>
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
  `,
  "maintenance": `
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
                      <TableCell className="font-mono">\${item.cost.toFixed(2)}</TableCell>
                      <TableCell>
                        {item.resolutionTime !== null ? \`\${item.resolutionTime} days\` : '-'}
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
  `,
  "trust-ledger": `
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
                      <TableCell className={\`text-right font-mono \${item.type.includes('release') || item.type.includes('deduction') ? 'text-red-500' : 'text-green-500'}\`}>
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
  `
};

for (const [folder, content] of Object.entries(templates)) {
  const dirPath = path.join(basePath, folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(path.join(dirPath, 'page.tsx'), content.trim() + '\\n');
}

console.log("Created all report pages.");
