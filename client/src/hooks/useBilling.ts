import { useState } from "react";
import { apiClient } from "@/lib/api-client";

export interface SubscribeResult {
  requiresPayment: boolean;
  tier?: string;
  redirectUrl?: string;
  paymentId?: string;
}

export interface SubscriptionPayment {
  id: string;
  tier: string;
  amount: string | number;
  currency: string;
  status: "created" | "paid" | "cancelled" | "failed";
  method: string;
  period_start: string;
  period_end: string;
  paid_at: string | null;
  created_at: string;
}

export function useBilling() {
  const [loading, setLoading] = useState(false);

  const subscribe = async (tier: string): Promise<{ success: true; data: SubscribeResult } | { success: false; error: string }> => {
    setLoading(true);
    const res = await apiClient<SubscribeResult>("/billing/subscribe", { method: "POST", data: { tier } });
    setLoading(false);
    return res;
  };

  const getStatus = async (paymentId: string): Promise<SubscriptionPayment | null> => {
    const res = await apiClient<SubscriptionPayment>(`/billing/status/${paymentId}`);
    return res.success ? res.data : null;
  };

  const listPayments = async (): Promise<SubscriptionPayment[]> => {
    const res = await apiClient<SubscriptionPayment[]>("/billing/payments");
    return res.success ? res.data : [];
  };

  return { subscribe, getStatus, listPayments, loading };
}
