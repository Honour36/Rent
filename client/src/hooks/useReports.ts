import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export interface OwnerStatementDto {
  id: string;
  account_id: string;
  owner_id: string;
  period_month: number;
  period_year: number;
  status: "draft" | "approved" | "dispatched";
  pdf_url: string | null;
  approved_by: string | null;
  approved_at: string | null;
  dispatched_at: string | null;
  created_at: string;
  owner: {
    id: string;
    full_name: string;
  };
  approver: {
    id: string;
    full_name: string | null;
  } | null;
}

export interface StatementData {
  owner: {
    id: string;
    full_name: string;
    email: string | null;
    bank_name: string | null;
    bank_account: string | null;
  };
  period: { month: number; year: number };
  properties: {
    propertyId: string;
    propertyName: string;
    units: {
      unitNumber: string;
      tenantName: string | null;
      rentDue: number;
      amountCollected: number;
      status: string;
      currency: string;
    }[];
    subtotalRentDue: number;
    subtotalCollected: number;
  }[];
  totals: {
    rentDue: number;
    rentCollected: number;
    managementFee: number;
    maintenanceCosts: number;
    trustBalance: number;
    netPayable: number;
    currency: string;
  };
  statementId: string;
  status: string;
}

export interface ArrearsReportItem {
  tenancyId: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  amountOwed: number;
  currency: string;
  daysOverdue: number;
}

export interface VacancyReportItem {
  unitId: string;
  propertyName: string;
  unitNumber: string;
  daysVacant: number;
  rentAmount: number;
  currency: string;
}

export interface LeaseExpiryReportItem {
  tenancyId: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  leaseEnd: string;
  rentAmount: number;
  currency: string;
}

export interface CollectionRateReportItem {
  month: number;
  year: number;
  collected: number;
  due: number;
  rate: number;
}

export interface MaintenanceReportItem {
  requestId: string;
  propertyName: string;
  unitNumber: string;
  title: string;
  priority: string;
  status: string;
  cost: number;
  loggedDate: string;
  resolutionTime: number | null;
}

export interface TrustLedgerReportItem {
  transactionId: string;
  date: string;
  ownerName: string;
  tenantName: string;
  unitNumber: string;
  type: string;
  amount: number;
  currency: string;
  description: string | null;
}

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const listOwnerStatements = useCallback(async (ownerId?: string) => {
    setLoading(true);
    setError("");
    const url = ownerId ? `/reports/owner-statement?ownerId=${ownerId}` : "/reports/owner-statement";
    const res = await apiClient<OwnerStatementDto[]>(url);
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return [];
    }
    return res.data;
  }, []);

  const generateOwnerStatement = async (ownerId: string, periodMonth: number, periodYear: number) => {
    setLoading(true);
    setError("");
    const res = await apiClient<StatementData>("/reports/owner-statement/generate", {
      method: "POST",
      data: { ownerId, periodMonth, periodYear },
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return { success: false as const, error: res.error };
    }
    return { success: true as const, data: res.data };
  };

  const approveOwnerStatement = async (id: string) => {
    setLoading(true);
    setError("");
    const res = await apiClient<OwnerStatementDto>(`/reports/owner-statement/${id}/approve`, {
      method: "POST",
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return { success: false as const, error: res.error };
    }
    return { success: true as const, data: res.data };
  };

  const dispatchOwnerStatement = async (id: string) => {
    setLoading(true);
    setError("");
    const res = await apiClient<OwnerStatementDto>(`/reports/owner-statement/${id}/dispatch`, {
      method: "POST",
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return { success: false as const, error: res.error };
    }
    return { success: true as const, data: res.data };
  };

  const getArrearsReport = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await apiClient<ArrearsReportItem[]>("/reports/arrears");
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return [];
    }
    return res.data;
  }, []);

  const getVacancyReport = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await apiClient<VacancyReportItem[]>("/reports/vacancy");
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return [];
    }
    return res.data;
  }, []);

  const getLeaseExpiryReport = useCallback(async (days: number = 30) => {
    setLoading(true);
    setError("");
    const res = await apiClient<LeaseExpiryReportItem[]>(`/reports/lease-expiry?days=${days}`);
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return [];
    }
    return res.data;
  }, []);

  const getCollectionRateReport = useCallback(async (propertyId?: string) => {
    setLoading(true);
    setError("");
    const url = propertyId ? `/reports/collection-rate?propertyId=${propertyId}` : "/reports/collection-rate";
    const res = await apiClient<CollectionRateReportItem[]>(url);
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return [];
    }
    return res.data;
  }, []);

  const getMaintenanceReport = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await apiClient<MaintenanceReportItem[]>("/reports/maintenance");
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return [];
    }
    return res.data;
  }, []);

  const getTrustLedgerReport = useCallback(async (ownerId?: string) => {
    setLoading(true);
    setError("");
    const url = ownerId ? `/reports/trust-ledger?ownerId=${ownerId}` : "/reports/trust-ledger";
    const res = await apiClient<TrustLedgerReportItem[]>(url);
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return [];
    }
    return res.data;
  }, []);

  return {
    listOwnerStatements,
    generateOwnerStatement,
    approveOwnerStatement,
    dispatchOwnerStatement,
    getArrearsReport,
    getVacancyReport,
    getLeaseExpiryReport,
    getCollectionRateReport,
    getMaintenanceReport,
    getTrustLedgerReport,
    loading,
    error,
  };
}
