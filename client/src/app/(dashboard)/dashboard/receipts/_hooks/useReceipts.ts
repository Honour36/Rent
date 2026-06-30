import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export function useReceipts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getReceipt = useCallback(async (paymentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient<any>(`/receipts/${paymentId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch receipt');
      }
      return response.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendReceipt = useCallback(async (paymentId: string, channel: 'email' | 'whatsapp') => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient<any>(`/receipts/${paymentId}/send`, {
        data: { channel },
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to send receipt');
      }
      return response.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getReceipt,
    sendReceipt,
    loading,
    error,
  };
}
