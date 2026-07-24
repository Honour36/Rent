"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Check, Download, FileText, Send } from "@/components/icons";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOwners } from "@/hooks/useOwners";
import { useReports, type StatementData, type OwnerStatementDto } from "@/hooks/useReports";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

function OwnerStatementPageInner() {
  const searchParams = useSearchParams();
  const { owners, loading: ownersLoading } = useOwners();
  const { generateOwnerStatement, approveOwnerStatement, dispatchOwnerStatement, listOwnerStatements, loading } = useReports();

  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(searchParams.get("ownerId") ?? "");
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));

  const [statementData, setStatementData] = useState<StatementData | null>(null);
  const [recentStatements, setRecentStatements] = useState<OwnerStatementDto[]>([]);

  const fetchRecent = async (ownerId: string) => {
    const list = await listOwnerStatements(ownerId);
    setRecentStatements(list);
  };

  useEffect(() => {
    if (selectedOwnerId) {
      fetchRecent(selectedOwnerId);
    } else {
      setRecentStatements([]);
    }
  }, [selectedOwnerId, listOwnerStatements]);

  const handleGenerate = async () => {
    if (!selectedOwnerId) {
      toast("Error", { description: "Please select an owner" });
      return;
    }

    const res = await generateOwnerStatement(selectedOwnerId, parseInt(selectedMonth), parseInt(selectedYear));
    if (res.success) {
      setStatementData(res.data);
      fetchRecent(selectedOwnerId);
      toast("Success", { description: "Statement generated" });
    } else {
      toast("Error", { description: res.error });
    }
  };

  const handleApprove = async () => {
    if (!statementData?.statementId) return;
    const res = await approveOwnerStatement(statementData.statementId);
    if (res.success) {
      setStatementData({ ...statementData, status: "approved" });
      fetchRecent(selectedOwnerId);
      toast("Approved", { description: "Statement has been approved for dispatch" });
    } else {
      toast("Error", { description: res.error });
    }
  };

  const handleDispatch = async () => {
    if (!statementData?.statementId) return;
    const res = await dispatchOwnerStatement(statementData.statementId);
    if (res.success) {
      setStatementData({ ...statementData, status: "dispatched" });
      fetchRecent(selectedOwnerId);
      toast("Dispatched", { description: "Statement has been emailed to the owner" });
    } else {
      toast("Error", { description: res.error });
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2000, i, 1);
    return { value: String(i + 1), label: format(d, "MMMM") };
  });

  const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Owner Statement</h1>
        <p className="text-sm text-muted-foreground">Generate and dispatch monthly owner statements</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Select owner and period to generate a statement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Owner</label>
              <Select value={selectedOwnerId} onValueChange={setSelectedOwnerId} disabled={ownersLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full" onClick={handleGenerate} disabled={loading || !selectedOwnerId}>
              Generate Statement
            </Button>

            {recentStatements.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-4 text-sm font-medium">Recent Statements for Owner</h3>
                <div className="space-y-3">
                  {recentStatements.map((stmt) => (
                    <div key={stmt.id} className="flex flex-col gap-2 rounded-lg border p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {format(new Date(stmt.period_year, stmt.period_month - 1, 1), "MMM yyyy")}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          stmt.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                          stmt.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {stmt.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 flex-1"
                          onClick={() => window.open(`/api/reports/owner-statement/${stmt.id}/pdf`, "_blank")}
                        >
                          <FileText className="mr-2 h-3 w-3" />
                          View PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          {!statementData ? (
            <Card className="h-full">
              <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">No Statement Generated</h3>
                <p className="text-sm text-muted-foreground">
                  Select an owner and period to view statement details.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between border-b pb-6">
                <div>
                  <CardTitle>Statement Preview</CardTitle>
                  <CardDescription>
                    {format(new Date(statementData.period.year, statementData.period.month - 1, 1), "MMMM yyyy")} - {statementData.owner.full_name}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(`/api/reports/owner-statement/${statementData.statementId}/pdf`, "_blank")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  {statementData.status === "draft" && (
                    <Button onClick={handleApprove} disabled={loading}>
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  )}
                  {statementData.status === "approved" && (
                    <Button onClick={handleDispatch} disabled={loading} className="bg-green-600 hover:bg-green-700">
                      <Send className="mr-2 h-4 w-4" />
                      Dispatch
                    </Button>
                  )}
                  {statementData.status === "dispatched" && (
                    <Button disabled variant="outline" className="border-green-200 bg-green-50 text-green-700">
                      <Check className="mr-2 h-4 w-4" />
                      Dispatched
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {statementData.properties.map((prop) => (
                  <div key={prop.propertyId} className="space-y-3">
                    <h4 className="font-semibold">{prop.propertyName}</h4>
                    <div className="rounded-lg border">
                      <div className="grid grid-cols-4 border-b bg-muted/50 p-3 text-sm font-medium">
                        <div>Unit</div>
                        <div>Tenant</div>
                        <div className="text-right">Rent Due</div>
                        <div className="text-right">Collected</div>
                      </div>
                      <div className="divide-y">
                        {prop.units.map((unit) => (
                          <div key={unit.unitNumber} className="grid grid-cols-4 p-3 text-sm">
                            <div>{unit.unitNumber}</div>
                            <div className="text-muted-foreground">{unit.tenantName || "Vacant"}</div>
                            <div className="text-right">{formatCurrency(unit.rentDue, { currency: unit.currency })}</div>
                            <div className="text-right">{formatCurrency(unit.amountCollected, { currency: unit.currency })}</div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-4 bg-muted/20 p-3 text-sm font-medium">
                        <div className="col-span-2 text-right">Subtotal</div>
                        <div className="text-right">{formatCurrency(prop.subtotalRentDue, { currency: "USD" })}</div>
                        <div className="text-right text-green-600">{formatCurrency(prop.subtotalCollected, { currency: "USD" })}</div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-8 space-y-4 rounded-lg border bg-muted/10 p-6">
                  <h4 className="font-semibold">Statement Totals</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Rent Due</span>
                      <span>{formatCurrency(statementData.totals.rentDue, { currency: statementData.totals.currency })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Collected</span>
                      <span className="text-green-600">{formatCurrency(statementData.totals.rentCollected, { currency: statementData.totals.currency })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Management Fee</span>
                      <span className="text-red-600">-{formatCurrency(statementData.totals.managementFee, { currency: statementData.totals.currency })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Maintenance Deductions</span>
                      <span className="text-red-600">-{formatCurrency(statementData.totals.maintenanceCosts, { currency: statementData.totals.currency })}</span>
                    </div>
                    <div className="my-2 border-t" />
                    <div className="flex justify-between font-medium">
                      <span>Net Payable to Owner</span>
                      <span className="text-lg">{formatCurrency(statementData.totals.netPayable, { currency: statementData.totals.currency })}</span>
                    </div>
                    <div className="mt-4 flex justify-between text-muted-foreground">
                      <span>Trust Account Balance</span>
                      <span>{formatCurrency(statementData.totals.trustBalance, { currency: statementData.totals.currency })}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OwnerStatementPage() {
  return (
    <Suspense fallback={null}>
      <OwnerStatementPageInner />
    </Suspense>
  );
}
