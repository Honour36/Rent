import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export interface ChecklistTemplateItemDto {
  id?: string;
  section?: string | null;
  label: string;
}

export interface ChecklistTemplateDto {
  id: string;
  name: string;
  description: string | null;
  items: ChecklistTemplateItemDto[];
}

export function useChecklistTemplates() {
  const [templates, setTemplates] = useState<ChecklistTemplateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const res = await apiClient<ChecklistTemplateDto[]>("/checklist-templates");
    if (res.success) setTemplates((res as any).data ?? []);
    else setError(res.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (data: { name: string; description?: string; items: ChecklistTemplateItemDto[] }) => {
    const res = await apiClient("/checklist-templates", { method: "POST", data });
    if (res.success) await fetchTemplates();
    return res;
  };

  const updateTemplate = async (id: string, data: { name: string; description?: string; items: ChecklistTemplateItemDto[] }) => {
    const res = await apiClient(`/checklist-templates/${id}`, { method: "PATCH", data });
    if (res.success) await fetchTemplates();
    return res;
  };

  const deleteTemplate = async (id: string) => {
    const res = await apiClient(`/checklist-templates/${id}`, { method: "DELETE" });
    if (res.success) await fetchTemplates();
    return res;
  };

  const getTemplateItems = async (id: string): Promise<ChecklistTemplateItemDto[]> => {
    const res = await apiClient<ChecklistTemplateDto>(`/checklist-templates/${id}`);
    if (res.success) return (res as any).data?.items ?? [];
    return [];
  };

  return { templates, loading, error, refetch: fetchTemplates, createTemplate, updateTemplate, deleteTemplate, getTemplateItems };
}
