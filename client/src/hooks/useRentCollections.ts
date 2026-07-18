import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export interface RentCollectionRequestDto {
  id: string;
  status: "pending" | "scheduled";
  scheduled_for: string | null;
  notes: string | null;
  created_at: string;
  owner: { full_name: string };
  payment: {
    amount_paid: string | number;
    currency: string;
    tenancy: { unit: { unit_number: string; property: { name: string } } };
  };
}

export function useRentCollections() {
  const [requests, setRequests] = useState<RentCollectionRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const res = await apiClient<RentCollectionRequestDto[]>("/rent-collection");
    if (res.success) setRequests((res as any).data ?? []);
    else setError(res.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, error, refetch: fetchRequests };
}
