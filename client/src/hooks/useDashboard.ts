import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export interface DashboardOverviewData {
  kpis: {
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    maintenanceUnits: number;
    arrearsCount: number;
    arrearsAmount: number;
    currentMonthRate: number;
    paymentsThisMonthCount: number;
    paymentsThisMonthAmount: number;
  };
  chartData: Array<{ name: string; due: number; collected: number }>;
  arrearsTable: Array<{
    tenancyId: string;
    tenantName: string;
    propertyName: string;
    unitNumber: string;
    amountOwed: number;
    currency: string;
    daysOverdue: number;
  }>;
  expiringLeases: Array<{
    tenancyId: string;
    tenantName: string;
    propertyName: string;
    unitNumber: string;
    leaseEnd: string;
    rentAmount: number;
    currency: string;
  }>;
  maintenanceAlerts: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    unitNumber: string;
    propertyName: string;
    createdAt: string;
  }>;
  recentPayments: Array<{
    id: string;
    amount: number;
    currency: string;
    date: string;
    status: string;
    tenantName: string;
    propertyName: string;
    unitNumber: string;
  }>;
}

export function useDashboard() {
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient<DashboardOverviewData>('/dashboard/overview');
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch dashboard data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { data, loading, error, refetch: fetchOverview };
}
