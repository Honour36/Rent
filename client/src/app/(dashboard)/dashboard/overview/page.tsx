"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Building2, Home, AlertTriangle, Activity, CheckCircle2, TrendingUp, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function OverviewPage() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>;
  }

  if (error || !data) {
    return <div className="p-8 text-center text-destructive">Error loading dashboard: {error}</div>;
  }

  const { kpis, chartData, arrearsTable, expiringLeases, maintenanceAlerts, recentPayments } = data;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Portfolio performance at a glance.</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalUnits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpis.occupiedUnits} Occupied · {kpis.vacantUnits} Vacant
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.currentMonthRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arrears</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(kpis.arrearsAmount, { currency: "USD" })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across {kpis.arrearsCount} tenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceAlerts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Open high/emergency requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Rent Collection vs Due (6 Months)</CardTitle>
          <CardDescription>Historical performance of your portfolio.</CardDescription>
        </CardHeader>
        <CardContent className="pl-0">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <Tooltip />
                <Area type="monotone" dataKey="due" stroke="hsl(var(--muted-foreground))" fillOpacity={1} fill="url(#colorDue)" name="Rent Due" />
                <Area type="monotone" dataKey="collected" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCollected)" name="Collected" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Arrears */}
        <Card>
          <CardHeader>
            <CardTitle>Top Arrears</CardTitle>
            <CardDescription>Tenants with the highest outstanding balances.</CardDescription>
          </CardHeader>
          <CardContent>
            {arrearsTable.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tenants in arrears.</p>
            ) : (
              <div className="space-y-4">
                {arrearsTable.map((arrear) => (
                  <div key={arrear.tenancyId} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{arrear.tenantName}</p>
                      <p className="text-xs text-muted-foreground">{arrear.propertyName} - {arrear.unitNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-destructive">{formatCurrency(arrear.amountOwed, { currency: arrear.currency })}</p>
                      <p className="text-xs text-muted-foreground">{arrear.daysOverdue} days overdue</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring Leases */}
        <Card>
          <CardHeader>
            <CardTitle>Expiring Leases (30 Days)</CardTitle>
            <CardDescription>Tenancies ending soon.</CardDescription>
          </CardHeader>
          <CardContent>
            {expiringLeases.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leases expiring in the next 30 days.</p>
            ) : (
              <div className="space-y-4">
                {expiringLeases.map((lease) => (
                  <div key={lease.tenancyId} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{lease.tenantName}</p>
                      <p className="text-xs text-muted-foreground">{lease.propertyName} - {lease.unitNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{format(new Date(lease.leaseEnd), "dd MMM yyyy")}</p>
                      <p className="text-xs text-muted-foreground">Expiring</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Maintenance Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Alerts</CardTitle>
            <CardDescription>High and emergency priority requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {maintenanceAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No critical maintenance requests.</p>
            ) : (
              <div className="space-y-4">
                {maintenanceAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.propertyName} - {alert.unitNumber}</p>
                    </div>
                    <div>
                      <Badge variant={alert.priority === 'emergency' ? 'destructive' : 'default'}>
                        {alert.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>The last 5 payments recorded.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent payments.</p>
            ) : (
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{payment.tenantName}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(payment.date), "dd MMM yyyy")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(payment.amount, { currency: payment.currency })}</p>
                      <Badge variant="outline" className="text-[10px] mt-1 uppercase tracking-wider">{payment.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
