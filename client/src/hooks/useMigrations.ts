import { useState } from "react";
import { apiClient } from "@/lib/api-client";

export type MigrationField =
  | "property_address" | "property_suburb" | "property_city" | "property_type"
  | "owner_name" | "owner_phone" | "owner_email"
  | "tenant_name" | "tenant_phone" | "tenant_email"
  | "rent_amount" | "currency"
  | "lease_start" | "lease_end" | "deposit_amount";

export interface FieldDef {
  field: MigrationField;
  label: string;
  required: boolean;
  aliases: string[];
  hint: string;
}

export interface ParsedPreview {
  headers: string[];
  mapping: Record<number, MigrationField | null>;
  rows: unknown[][];
  totalRows: number;
  sheetName: string;
  warnings: string[];
}

export interface RowResult {
  row: number;
  status: "created" | "matched" | "skipped";
  detail: string;
  warnings: string[];
}

export interface CommitSummary {
  ownersCreated: number;
  ownersMatched: number;
  propertiesCreated: number;
  propertiesMatched: number;
  tenantsCreated: number;
  tenantsMatched: number;
  tenanciesCreated: number;
  rowsSkipped: number;
  results: RowResult[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export function useMigrations() {
  const [uploading, setUploading] = useState(false);
  const [committing, setCommitting] = useState(false);

  const getFields = async (): Promise<FieldDef[]> => {
    const res = await apiClient<FieldDef[]>("/migrations/fields");
    return res.success ? res.data : [];
  };

  const downloadTemplate = () => {
    window.open(`${API_BASE}/migrations/template`, "_blank");
  };

  const preview = async (file: File): Promise<{ success: true; data: ParsedPreview } | { success: false; error: string }> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      // Multipart body - must bypass apiClient, which always JSON.stringifies
      // `data` (see the same workaround elsewhere: settings logo upload,
      // the public application ID upload).
      const res = await fetch(`${API_BASE}/migrations/preview`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) return { success: false, error: json.error || "Could not process the file." };
      return { success: true, data: json.data };
    } catch {
      return { success: false, error: "Network error while uploading the file." };
    } finally {
      setUploading(false);
    }
  };

  const commit = async (rows: unknown[][], mapping: Record<number, MigrationField | null>): Promise<{ success: true; data: CommitSummary } | { success: false; error: string }> => {
    setCommitting(true);
    const res = await apiClient<CommitSummary>("/migrations/commit", { method: "POST", data: { rows, mapping } });
    setCommitting(false);
    return res;
  };

  return { getFields, downloadTemplate, preview, commit, uploading, committing };
}
