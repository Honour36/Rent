"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Phone,
  Mail,
  Briefcase,
  CreditCard,
  Building2,
  MessageSquare,
  Calendar,
  FileText,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTenant } from "@/hooks/useTenants";

interface PageProps {
  params: Promise<{ id: string }>;
}

const MONTHS = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatCurrency(amount: number | string, currency: string) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (currency === "USD") return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  return `ZiG ${num.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function paymentStatusBadge(status: string) {
  switch (status) {
    case "paid":
      return <Badge variant="default">Paid</Badge>;
    case "partial":
      return <Badge variant="secondary">Partial</Badge>;
    case "late":
      return <Badge variant="destructive">Late</Badge>;
    case "unpaid":
      return <Badge variant="destructive">Unpaid</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function tenancyStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge variant="default">Active</Badge>;
    case "pending_deposit":
      return <Badge variant="secondary">Pending Deposit</Badge>;
    case "ended":
      return <Badge variant="outline">Ended</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function TenantDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { tenant, loading, error } = useTenant(id);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading tenant profile...</p>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-destructive">{error || "Tenant not found"}</p>
        <Link href="/dashboard/tenants">
          <Button variant="outline">Back to Tenants</Button>
        </Link>
      </div>
    );
  }

  const activeTenancy = tenant.tenancies.find((t) => t.status === "active") ?? null;
  const allPayments = tenant.tenancies.flatMap((t) =>
    t.payments.map((p) => ({
      ...p,
      tenancyId: t.id,
      unitNumber: t.unit.unit_number,
      propertyName: t.unit.property.name,
    })),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tenants">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{tenant.full_name}</h1>
          <p className="text-sm text-muted-foreground">Tenant Profile</p>
        </div>
      </div>

      {/* Personal Details + Employment */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{tenant.email || "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{tenant.phone || "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <span className="text-muted-foreground mr-1">ID:</span>
                {tenant.id_number || "—"}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <span className="text-muted-foreground mr-1">Registered:</span>
                {formatDate(tenant.created_at)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Employment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Employer</p>
                <p className="mt-1">{tenant.employer || "—"}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Status</p>
                <p className="mt-1 capitalize">{tenant.employment_status || "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="font-medium text-muted-foreground">Monthly Income</p>
                <p className="mt-1">
                  {tenant.monthly_income
                    ? formatCurrency(tenant.monthly_income, "USD")
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Lease Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Current Lease
          </CardTitle>
          <CardDescription>
            {activeTenancy
              ? `Active tenancy at ${activeTenancy.unit.property.name}, Unit ${activeTenancy.unit.unit_number}`
              : "No active tenancy"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTenancy ? (
            <div className="grid grid-cols-2 gap-6 text-sm md:grid-cols-4">
              <div>
                <p className="font-medium text-muted-foreground">Property</p>
                <p className="mt-1 font-medium">{activeTenancy.unit.property.name}</p>
                <p className="text-muted-foreground">{activeTenancy.unit.property.city || ""}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Unit</p>
                <p className="mt-1">{activeTenancy.unit.unit_number}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Rent</p>
                <p className="mt-1 font-medium">
                  {formatCurrency(activeTenancy.rent_amount, activeTenancy.currency)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">/mo</span>
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Deposit</p>
                <p className="mt-1">
                  {activeTenancy.deposit_amount
                    ? formatCurrency(activeTenancy.deposit_amount, activeTenancy.currency)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Lease Start</p>
                <p className="mt-1">{formatDate(activeTenancy.lease_start)}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Lease End</p>
                <p className="mt-1">{formatDate(activeTenancy.lease_end)}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Due Day</p>
                <p className="mt-1">
                  {activeTenancy.rent_due_day
                    ? `${activeTenancy.rent_due_day}${ordinal(activeTenancy.rent_due_day)} of month`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Status</p>
                <p className="mt-1">{tenancyStatusBadge(activeTenancy.status)}</p>
              </div>
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
              <p className="text-sm text-muted-foreground">
                No active tenancy. Tenant may be between leases or pending application approval.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            All recorded payments across all tenancies for this tenant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allPayments.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
              <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Period
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Property / Unit
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Method
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase text-muted-foreground">
                      Receipt
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPayments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm text-foreground">
                        {MONTHS[payment.period_month]} {payment.period_year}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="font-medium text-foreground">{payment.propertyName}</span>
                          <span className="text-muted-foreground">Unit {payment.unitNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {formatCurrency(payment.amount_paid, payment.currency)}
                      </TableCell>
                      <TableCell className="text-sm capitalize text-foreground">
                        {payment.method}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {formatDate(payment.payment_date)}
                      </TableCell>
                      <TableCell>{paymentStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right">
                        {payment.receipts.length > 0 ? (
                          <Link href={`/dashboard/receipts/${payment.receipts[0].id}`}>
                            <Button variant="ghost" size="sm">
                              #{payment.receipts[0].receipt_number}
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Communication Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Communication Log
          </CardTitle>
          <CardDescription>
            All messages sent to and from this tenant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tenant.communications.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
              <p className="text-sm text-muted-foreground">No communications recorded yet.</p>
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Channel
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Direction
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Subject / Preview
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenant.communications.map((comm) => (
                    <TableRow key={comm.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm text-foreground">
                        {formatDate(comm.sent_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {comm.channel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm capitalize text-muted-foreground">
                        {comm.direction}
                      </TableCell>
                      <TableCell className="max-w-sm text-sm text-foreground">
                        {comm.subject && (
                          <p className="font-medium">{comm.subject}</p>
                        )}
                        {comm.body && (
                          <p className="truncate text-muted-foreground">{comm.body}</p>
                        )}
                        {!comm.subject && !comm.body && (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
