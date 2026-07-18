import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export interface DepositDto {
  id: string;
  tenancy_id: string;
  required_amount: string | number;
  currency: string;
  status: "pending" | "partial" | "paid_in_full" | "released" | "forfeited";
  resolved_amount: string | number | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  paid_amount: number;
  balance: number;
  tenancy: {
    tenant: { full_name: string };
    unit: { unit_number: string; property: { name: string } };
  };
}

export function useDeposits() {
  const [deposits, setDeposits] = useState<DepositDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDeposits = useCallback(async () => {
    setLoading(true);
    const res = await apiClient<DepositDto[]>("/deposits");
    if (res.success) setDeposits((res as any).data ?? []);
    else setError(res.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  const resolveDeposit = async (tenancyId: string, data: { outcome: "released" | "forfeited"; resolvedAmount: number; notes?: string }) => {
    const res = await apiClient(`/deposits/tenancy/${tenancyId}/resolve`, { method: "POST", data });
    if (res.success) await fetchDeposits();
    return res;
  };

  return { deposits, loading, error, refetch: fetchDeposits, resolveDeposit };
}
