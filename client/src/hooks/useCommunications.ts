import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export interface CommunicationDto {
  id: string;
  account_id: string;
  tenant_id: string;
  channel: "email" | "whatsapp";
  direction: string;
  subject: string | null;
  body: string | null;
  sent_by: string | null;
  sent_at: string;
  tenant: {
    id: string;
    full_name: string;
    phone: string | null;
    email: string | null;
  };
  sender: {
    id: string;
    full_name: string | null;
  } | null;
}

export interface CommunicationListResult {
  records: CommunicationDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ComposeCommunicationDto {
  tenantId: string;
  channel: "email" | "whatsapp";
  subject?: string;
  body: string;
}

export interface ComposeCommunicationResult {
  communication: CommunicationDto;
  waLink: string | null;
}

export function useCommunications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const listCommunications = useCallback(
    async (filters: { tenantId?: string; channel?: string; page?: number } = {}) => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (filters.tenantId) params.set("tenantId", filters.tenantId);
      if (filters.channel && filters.channel !== "all") params.set("channel", filters.channel);
      if (filters.page) params.set("page", String(filters.page));

      const url = `/communications${params.toString() ? `?${params}` : ""}`;
      const res = await apiClient<CommunicationListResult>(url);
      setLoading(false);
      if (!res.success) {
        setError(res.error);
        return { records: [], total: 0, page: 1, pageSize: 50 };
      }
      return res.data;
    },
    [],
  );

  const compose = async (data: ComposeCommunicationDto) => {
    setLoading(true);
    setError("");
    const res = await apiClient<ComposeCommunicationResult>("/communications", {
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

  return { listCommunications, compose, loading, error };
}
