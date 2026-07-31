import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export interface ActivateTenancyDto {
  depositAmount?: number;
  rentDueDay: number;
  leaseStartDate: string;
  leaseEndDate: string;
  rentAmount: number;
}

export function useTenancies() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getPendingByUnitId = useCallback(async (unitId: string) => {
    setLoading(true);
    setError("");
    const res = await apiClient<any>(`/tenancies/pending/unit/${unitId}`);
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return null;
    }
    return res.data;
  }, []);

  const activateTenancy = async (id: string, data: ActivateTenancyDto) => {
    setLoading(true);
    setError("");
    const res = await apiClient<any>(`/tenancies/${id}/activate`, {
      method: "PATCH",
      data,
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return { success: false, error: res.error };
    }
    return { success: true, data: res.data };
  };

  const getLeaseSignedUrl = useCallback(async (tenancyId: string) => {
    const res = await apiClient<{ url: string }>(`/tenancies/${tenancyId}/lease/signed-url`);
    if (!res.success) return { success: false as const, error: res.error };
    return { success: true as const, url: res.data.url };
  }, []);

  const generateLease = useCallback(async (tenancyId: string) => {
    const res = await apiClient<{ generated: boolean }>(`/tenancies/${tenancyId}/lease/generate`, { method: "POST" });
    if (!res.success) return { success: false as const, error: res.error };
    return { success: true as const };
  }, []);

  return { getPendingByUnitId, activateTenancy, getLeaseSignedUrl, generateLease, loading, error };
}
