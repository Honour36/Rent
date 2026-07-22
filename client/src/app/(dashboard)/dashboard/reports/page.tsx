"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeAlert, CalendarOff, LineChart, Wrench, Building, BookText, FileText } from "@/components/icons";
import Link from "next/link";

const reports = [
  {
    title: "Owner Statements",
    description: "Generate and dispatch monthly statements to owners.",
    icon: FileText,
    href: "/dashboard/reports/owner-statement",
    color: "text-blue-500",
  },
  {
    title: "Arrears Report",
    description: "Tenancies with outstanding balances and days overdue.",
    icon: BadgeAlert,
    href: "/dashboard/reports/arrears",
    color: "text-red-500",
  },
  {
    title: "Vacancy Report",
    description: "Currently vacant units and their vacancy duration.",
    icon: Building,
    href: "/dashboard/reports/vacancy",
    color: "text-orange-500",
  },
  {
    title: "Lease Expiry Report",
    description: "Tenancies expiring within 30, 60, or 90 days.",
    icon: CalendarOff,
    href: "/dashboard/reports/lease-expiry",
    color: "text-amber-500",
  },
  {
    title: "Collection Rate",
    description: "Monthly rent collection percentage and trends.",
    icon: LineChart,
    href: "/dashboard/reports/collection-rate",
    color: "text-green-500",
  },
  {
    title: "Maintenance Report",
    description: "Maintenance costs and resolution times.",
    icon: Wrench,
    href: "/dashboard/reports/maintenance",
    color: "text-indigo-500",
  },
  {
    title: "Trust Account Ledger",
    description: "Log of all trust transactions by owner.",
    icon: BookText,
    href: "/dashboard/reports/trust-ledger",
    color: "text-purple-500",
  },
];

export default function ReportsIndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports Hub</h1>
        <p className="text-muted-foreground mt-2">
          Financial and operational reports for your portfolio.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Link href={report.href} key={report.href}>
            <Card className="hover:bg-muted/50 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">
                  {report.title}
                </CardTitle>
                <report.icon className={`h-5 w-5 ${report.color}`} />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {report.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
