import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";

export interface TenantListItem {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  id_number: string | null;
  date_of_birth: string | null;
  employer: string | null;
  employment_status: string | null;
  monthly_income: number | null;
  activeTenancy: {
    id: string;
    status: string;
    rent_amount: number;
    currency: string;
    lease_start: string;
    lease_end: string | null;
    unit: {
      unit_number: string;
      property: { name: string; address: string | null; city: string | null };
    };
  } | null;
  /** Rent balance owed > 0. isOverdue is the same value - only one arrears
   * severity exists, kept as two fields for backward compat with callers
   * that read either name. */
  hasArrears: boolean;
  isOverdue: boolean;
  currentPayment: {
    amount_paid: number;
    status: string;
    period_month: number;
    period_year: number;
  } | null;
}

export interface TenantDetail {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  id_number: string | null;
  date_of_birth: string | null;
  employer: string | null;
  employment_status: string | null;
  monthly_income: number | null;
  created_at: string;
  tenancies: Array<{
    id: string;
    status: string;
    rent_amount: number;
    currency: string;
    deposit_amount: number | null;
    lease_start: string;
    lease_end: string | null;
    rent_due_day: number | null;
    unit: {
      unit_number: string;
      property: { name: string; address: string | null; city: string | null };
    };
    payments: Array<{
      id: string;
      period_month: number;
      period_year: number;
      amount_paid: number;
      currency: string;
      method: string;
      status: string;
      payment_date: string;
      reference: string | null;
      receipts: Array<{ id: string; receipt_number: string; pdf_url: string | null }>;
    }>;
  }>;
  communications: Array<{
    id: string;
    channel: string;
    direction: string;
    subject: string | null;
    body: string | null;
    sent_at: string;
  }>;
}

/** Alias kept for backward compat with tenantsPage */
export type Tenant = TenantListItem;

export function useTenants() {
  const [tenants, setTenants] = useState<TenantListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasLoadedOnce = useRef(false);

  const fetchTenants = async () => {
    if (!hasLoadedOnce.current) setLoading(true);
    const res = await apiClient<TenantListItem[]>("/tenants");
    if (res.success) {
      setTenants(res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
    hasLoadedOnce.current = true;
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  return { tenants, loading, error, refetch: fetchTenants };
}

export function useTenant(id: string) {
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasLoadedOnce = useRef(false);

  const fetchTenant = async () => {
    if (!hasLoadedOnce.current) setLoading(true);
    const res = await apiClient<TenantDetail>(`/tenants/${id}`);
    if (res.success) {
      setTenant(res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
    hasLoadedOnce.current = true;
  };

  useEffect(() => {
    if (id) fetchTenant();
  }, [id]);

  return { tenant, loading, error, refetch: fetchTenant };
}
