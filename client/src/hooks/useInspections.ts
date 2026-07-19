import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export interface InspectionItemDto {
  id?: string;
  section?: string | null;
  label: string;
  checked: boolean;
  disputed?: boolean;
  notes?: string;
}

export interface InspectionDto {
  id: string;
  tenancy_id: string;
  type: "move_in" | "periodic" | "move_out";
  status: "scheduled" | "completed" | "cancelled";
  scheduled_for: string | null;
  completed_at: string | null;
  outcome: "pass" | "fail" | null;
  notes: string | null;
  items: InspectionItemDto[];
  tenancy: {
    tenant: { full_name: string };
    unit: { unit_number: string; property: { name: string } };
  };
  conductor: { full_name: string } | null;
}

export function useInspections() {
  const [inspections, setInspections] = useState<InspectionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInspections = useCallback(async () => {
    setLoading(true);
    const res = await apiClient<InspectionDto[]>("/inspections");
    if (res.success) setInspections((res as any).data ?? []);
    else setError(res.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  const scheduleInspection = async (data: { tenancyId: string; type: string; scheduledFor: string }) => {
    const res = await apiClient("/inspections", { method: "POST", data });
    if (res.success) await fetchInspections();
    return res;
  };

  const completeInspection = async (id: string, data: { outcome: "pass" | "fail"; notes?: string; items?: InspectionItemDto[]; depositResolvedAmount?: number }) => {
    const res = await apiClient(`/inspections/${id}/complete`, { method: "POST", data });
    if (res.success) await fetchInspections();
    return res;
  };

  const fetchSuggestedItems = async (tenancyId: string): Promise<InspectionItemDto[]> => {
    const res = await apiClient<{ label: string; section?: string | null }[]>(`/inspections/tenancy/${tenancyId}/suggested-items`);
    if (res.success) return ((res as any).data ?? []).map((i: { label: string; section?: string | null }) => ({ label: i.label, section: i.section, checked: false }));
    return [];
  };

  const cancelInspection = async (id: string) => {
    const res = await apiClient(`/inspections/${id}/cancel`, { method: "POST" });
    if (res.success) await fetchInspections();
    return res;
  };

  return { inspections, loading, error, refetch: fetchInspections, scheduleInspection, completeInspection, cancelInspection, fetchSuggestedItems };
}
