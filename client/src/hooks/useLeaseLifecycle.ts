import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export interface LeaseRenewalDto {
  id: string;
  tenancy_id: string;
  previous_lease_end: string | null;
  new_lease_end: string;
  lease_fee_amount: string | number | null;
  currency: string | null;
  notes: string | null;
  created_at: string;
  tenancy: {
    tenant: { full_name: string };
    unit: { unit_number: string; property: { name: string } };
  };
}

export interface NoticeToVacateDto {
  id: string;
  tenancy_id: string;
  reason: "eviction" | "sale" | "tenant_request" | "other";
  notice_date: string;
  vacate_by: string;
  notes: string | null;
  status: "active" | "withdrawn" | "fulfilled";
  tenancy: {
    tenant: { full_name: string };
    unit: { unit_number: string; property: { name: string } };
  };
}

export function useLeaseLifecycle() {
  const [renewals, setRenewals] = useState<LeaseRenewalDto[]>([]);
  const [notices, setNotices] = useState<NoticeToVacateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [renewalsRes, noticesRes] = await Promise.all([
      apiClient<LeaseRenewalDto[]>("/lease-renewals"),
      apiClient<NoticeToVacateDto[]>("/notices-to-vacate"),
    ]);
    if (renewalsRes.success) setRenewals((renewalsRes as any).data ?? []);
    if (noticesRes.success) setNotices((noticesRes as any).data ?? []);
    if (!renewalsRes.success) setError(renewalsRes.error);
    else if (!noticesRes.success) setError((noticesRes as any).error);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createRenewal = async (data: { tenancyId: string; newLeaseEnd: string; leaseFeeAmount?: number; notes?: string }) => {
    const res = await apiClient("/lease-renewals", { method: "POST", data });
    if (res.success) await fetchAll();
    return res;
  };

  const createNotice = async (data: { tenancyId: string; reason: string; noticeDate: string; vacateBy: string; notes?: string }) => {
    const res = await apiClient("/notices-to-vacate", { method: "POST", data });
    if (res.success) await fetchAll();
    return res;
  };

  const withdrawNotice = async (id: string) => {
    const res = await apiClient(`/notices-to-vacate/${id}/withdraw`, { method: "POST" });
    if (res.success) await fetchAll();
    return res;
  };

  return { renewals, notices, loading, error, refetch: fetchAll, createRenewal, createNotice, withdrawNotice };
}
