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
  monthMapping: Record<number, number>;
  inferredYear: number;
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
  paymentsImported: number;
  rowsSkipped: number;
  results: RowResult[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const COMMIT_BATCH_SIZE = 25;

const EMPTY_SUMMARY: CommitSummary = {
  ownersCreated: 0, ownersMatched: 0,
  propertiesCreated: 0, propertiesMatched: 0,
  tenantsCreated: 0, tenantsMatched: 0,
  tenanciesCreated: 0, paymentsImported: 0, rowsSkipped: 0,
  results: [],
};

function mergeSummary(into: CommitSummary, part: CommitSummary): CommitSummary {
  return {
    ownersCreated: into.ownersCreated + part.ownersCreated,
    ownersMatched: into.ownersMatched + part.ownersMatched,
    propertiesCreated: into.propertiesCreated + part.propertiesCreated,
    propertiesMatched: into.propertiesMatched + part.propertiesMatched,
    tenantsCreated: into.tenantsCreated + part.tenantsCreated,
    tenantsMatched: into.tenantsMatched + part.tenantsMatched,
    tenanciesCreated: into.tenanciesCreated + part.tenanciesCreated,
    paymentsImported: into.paymentsImported + part.paymentsImported,
    rowsSkipped: into.rowsSkipped + part.rowsSkipped,
    results: [...into.results, ...part.results],
  };
}

export function useMigrations() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // 0-100
  const [committing, setCommitting] = useState(false);
  const [commitProgress, setCommitProgress] = useState(0); // 0-100

  const getFields = async (): Promise<FieldDef[]> => {
    const res = await apiClient<FieldDef[]>("/migrations/fields");
    return res.success ? res.data : [];
  };

  const downloadTemplate = () => {
    window.open(`${API_BASE}/migrations/template`, "_blank");
  };

  /**
   * XMLHttpRequest instead of fetch specifically so we get real upload
   * progress events (`upload.onprogress`) - fetch has no equivalent for
   * request-body upload progress in any currently-shipping browser.
   */
  const preview = (file: File): Promise<{ success: true; data: ParsedPreview } | { success: false; error: string }> => {
    setUploading(true);
    setUploadProgress(0);
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE}/migrations/preview`);
      xhr.withCredentials = true;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      };

      xhr.onload = () => {
        setUploading(false);
        try {
          const json = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && json.success) {
            resolve({ success: true, data: json.data });
          } else {
            resolve({ success: false, error: json.error || "Could not process the file." });
          }
        } catch {
          resolve({ success: false, error: "The server returned an unexpected response. Please try again." });
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        resolve({ success: false, error: "Network error while uploading the file." });
      };

      const formData = new FormData();
      formData.append("file", file);
      xhr.send(formData);
    });
  };

  /**
   * Commits in batches rather than one giant request - this is what makes a
   * real progress bar possible (each batch that completes is a known
   * fraction of the total), and as a side benefit keeps each individual
   * request body small regardless of how large the source spreadsheet is.
   */
  const commit = async (
    rows: unknown[][],
    mapping: Record<number, MigrationField | null>,
    monthMapping: Record<number, number>,
    year: number
  ): Promise<{ success: true; data: CommitSummary } | { success: false; error: string }> => {
    setCommitting(true);
    setCommitProgress(0);

    let summary = EMPTY_SUMMARY;
    const totalBatches = Math.max(1, Math.ceil(rows.length / COMMIT_BATCH_SIZE));

    for (let b = 0; b < totalBatches; b++) {
      const batch = rows.slice(b * COMMIT_BATCH_SIZE, (b + 1) * COMMIT_BATCH_SIZE);
      if (batch.length === 0) break;

      // eslint-disable-next-line no-await-in-loop
      const res = await apiClient<CommitSummary>("/migrations/commit", { method: "POST", data: { rows: batch, mapping, monthMapping, year } });
      if (!res.success) {
        setCommitting(false);
        // Whatever succeeded in earlier batches is already saved - surface
        // that alongside the error rather than losing it from view.
        return { success: false, error: `${res.error} (${summary.results.length} of ${rows.length} rows had already been processed before this failure - that work is saved.)` };
      }
      summary = mergeSummary(summary, res.data);
      setCommitProgress(Math.round(((b + 1) / totalBatches) * 100));
    }

    setCommitting(false);
    return { success: true, data: summary };
  };

  return { getFields, downloadTemplate, preview, commit, uploading, uploadProgress, committing, commitProgress };
}
