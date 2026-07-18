import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export interface LevyChargeDto {
  id: string;
  property_id: string;
  name: string;
  amount: string | number;
  currency: string;
  frequency: "one_off" | "monthly" | "quarterly" | "annual";
  active: boolean;
  notes: string | null;
  property: { name: string };
}

export function useLevyCharges() {
  const [levyCharges, setLevyCharges] = useState<LevyChargeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLevyCharges = useCallback(async () => {
    setLoading(true);
    const res = await apiClient<LevyChargeDto[]>("/levy-charges");
    if (res.success) setLevyCharges((res as any).data ?? []);
    else setError(res.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLevyCharges();
  }, [fetchLevyCharges]);

  const createLevyCharge = async (data: { propertyId: string; name: string; amount: number; currency: string; frequency: string; notes?: string }) => {
    const res = await apiClient("/levy-charges", { method: "POST", data });
    if (res.success) await fetchLevyCharges();
    return res;
  };

  const deactivateLevyCharge = async (id: string) => {
    const res = await apiClient(`/levy-charges/${id}/deactivate`, { method: "POST" });
    if (res.success) await fetchLevyCharges();
    return res;
  };

  return { levyCharges, loading, error, refetch: fetchLevyCharges, createLevyCharge, deactivateLevyCharge };
}
