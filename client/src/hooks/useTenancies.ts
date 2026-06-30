import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export interface ActivateTenancyDto {
  depositAmount?: number;
  rentDueDay: number;
  leaseStartDate: string;
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

  return { getPendingByUnitId, activateTenancy, loading, error };
}
