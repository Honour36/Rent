"use client";

import { useEffect, useState } from "react";
import { usePayments, PaymentDto } from "@/hooks/usePayments";
import { PaymentListTable } from "@/components/payments/PaymentListTable";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "@/components/icons";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PaymentsPage() {
  const { listPayments, loading } = usePayments();
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      const filters = statusFilter !== "all" ? { status: statusFilter } : {};
      const data = await listPayments(filters);
      setPayments(data);
    };
    fetchPayments();
  }, [listPayments, statusFilter]);

  const filtered = payments.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.tenancy?.tenant?.full_name ?? "").toLowerCase().includes(q) ||
      (p.tenancy?.unit?.property?.name ?? "").toLowerCase().includes(q) ||
      (p.reference ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-1">
            Manage and record rent payments from tenants.
          </p>
        </div>
        <Link href="/dashboard/payments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Record Payment
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by tenant, property, or reference…" className="pl-9"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="late">Late</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground border rounded-md">
          Loading payments...
        </div>
      ) : (
        <PaymentListTable payments={filtered} onRefresh={() => { const filters = statusFilter !== "all" ? { status: statusFilter } : {}; listPayments(filters).then(setPayments); }} />
      )}
    </div>
  );
}
