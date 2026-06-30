import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export interface PaymentDto {
  id: string;
  account_id: string;
  tenancy_id: string;
  period_month: number;
  period_year: number;
  amount_paid: string | number;
  currency: string;
  zig_usd_rate: string | number | null;
  method: string;
  reference: string | null;
  status: string;
  payment_date: string;
  tenancy?: {
    tenant: {
      full_name: string;
    };
    unit: {
      unit_number: string;
      property: {
        name: string;
      };
    };
  };
  receipts?: any[];
}

export interface CreatePaymentDto {
  tenancyId: string;
  periodMonth: number;
  periodYear: number;
  amountPaid: number;
  currency: string;
  zigUsdRate?: number;
  method: string;
  reference?: string;
  paymentDate: string;
}

export function usePayments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const listPayments = useCallback(async (filters: any = {}) => {
    setLoading(true);
    setError("");
    const searchParams = new URLSearchParams();
    if (filters.status) searchParams.set("status", filters.status);
    if (filters.tenancyId) searchParams.set("tenancyId", filters.tenancyId);
    if (filters.tenantId) searchParams.set("tenantId", filters.tenantId);
    if (filters.propertyId) searchParams.set("propertyId", filters.propertyId);

    const queryString = searchParams.toString();
    const url = `/payments${queryString ? `?${queryString}` : ''}`;
    
    const res = await apiClient<PaymentDto[]>(url);
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return [];
    }
    return res.data;
  }, []);

  const createPayment = async (data: CreatePaymentDto) => {
    setLoading(true);
    setError("");
    const res = await apiClient<{ payment: PaymentDto, receipt: any }>(`/payments`, {
      method: "POST",
      data,
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return { success: false, error: res.error };
    }
    return { success: true, data: res.data };
  };

  return { listPayments, createPayment, loading, error };
}
