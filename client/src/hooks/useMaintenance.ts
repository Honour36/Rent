import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export interface MaintenanceRequestDto {
  id: string;
  account_id: string;
  unit_id: string;
  tenancy_id: string | null;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | "emergency";
  status: "open" | "in_progress" | "resolved" | "closed";
  cost: string | number | null;
  logged_by: string;
  resolved_at: string | null;
  created_at: string;
  unit: {
    id: string;
    unit_number: string;
    property: {
      id: string;
      name: string;
      address?: string;
    };
  };
  logger: {
    id: string;
    full_name: string | null;
  };
  tenancy?: {
    id: string;
    tenant: {
      id: string;
      full_name: string;
      phone: string | null;
    };
  } | null;
}

export interface MaintenanceListResult {
  records: MaintenanceRequestDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateMaintenanceDto {
  unitId: string;
  tenancyId?: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "emergency";
}

export interface UpdateMaintenanceDto {
  status?: "open" | "in_progress" | "resolved" | "closed";
  priority?: "low" | "medium" | "high" | "emergency";
  cost?: number;
  description?: string;
  title?: string;
}

export function useMaintenance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const listRequests = useCallback(
    async (
      filters: {
        status?: string;
        priority?: string;
        propertyId?: string;
        unitId?: string;
        page?: number;
      } = {},
    ) => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "all") params.set("status", filters.status);
      if (filters.priority && filters.priority !== "all") params.set("priority", filters.priority);
      if (filters.propertyId) params.set("propertyId", filters.propertyId);
      if (filters.unitId) params.set("unitId", filters.unitId);
      if (filters.page) params.set("page", String(filters.page));

      const url = `/maintenance${params.toString() ? `?${params}` : ""}`;
      const res = await apiClient<MaintenanceListResult>(url);
      setLoading(false);
      if (!res.success) {
        setError(res.error);
        return { records: [], total: 0, page: 1, pageSize: 50 };
      }
      return res.data;
    },
    [],
  );

  const getRequest = useCallback(async (id: string) => {
    setLoading(true);
    setError("");
    const res = await apiClient<MaintenanceRequestDto>(`/maintenance/${id}`);
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return null;
    }
    return res.data;
  }, []);

  const createRequest = async (data: CreateMaintenanceDto) => {
    setLoading(true);
    setError("");
    const res = await apiClient<MaintenanceRequestDto>("/maintenance", {
      method: "POST",
      data,
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return { success: false as const, error: res.error };
    }
    return { success: true as const, data: res.data };
  };

  const updateRequest = async (id: string, data: UpdateMaintenanceDto) => {
    setLoading(true);
    setError("");
    const res = await apiClient<MaintenanceRequestDto>(`/maintenance/${id}`, {
      method: "PATCH",
      data,
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return { success: false as const, error: res.error };
    }
    return { success: true as const, data: res.data };
  };

  return { listRequests, getRequest, createRequest, updateRequest, loading, error };
}
