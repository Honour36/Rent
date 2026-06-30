import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface Account {
  id: string;
  name: string;
  logo_url: string | null;
  subscription_tier: string | null;
  management_fee_pct: string | null;
}

export interface Template {
  id: string;
  name: string;
  channel: 'email' | 'whatsapp';
  subject: string | null;
  body: string;
}

export function useSettings() {
  const [account, setAccount] = useState<Account | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [accRes, tplRes] = await Promise.all([
      apiClient<Account>("/settings/account"),
      apiClient<Template[]>("/settings/templates")
    ]);

    if (accRes.success && accRes.data) {
      setAccount(accRes.data);
    }
    if (tplRes.success && tplRes.data) {
      setTemplates(tplRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateAccount = async (data: Partial<Account>) => {
    const res = await apiClient<Account>("/settings/account", { method: 'PATCH', data });
    if (res.success) {
      toast.success("Settings updated");
      fetchData();
      return true;
    } else {
      toast.error(res.error || "Error updating settings");
      return false;
    }
  };

  const createTemplate = async (data: Partial<Template>) => {
    const res = await apiClient<Template>("/settings/templates", { method: 'POST', data });
    if (res.success) {
      toast.success("Template created");
      fetchData();
      return true;
    } else {
      toast.error(res.error || "Error creating template");
      return false;
    }
  };

  const updateTemplate = async (id: string, data: Partial<Template>) => {
    const res = await apiClient<Template>(`/settings/templates/${id}`, { method: 'PUT', data });
    if (res.success) {
      toast.success("Template updated");
      fetchData();
      return true;
    } else {
      toast.error(res.error || "Error updating template");
      return false;
    }
  };

  const deleteTemplate = async (id: string) => {
    const res = await apiClient(`/settings/templates/${id}`, { method: 'DELETE' });
    if (res.success) {
      toast.success("Template deleted");
      fetchData();
      return true;
    } else {
      toast.error(res.error || "Error deleting template");
      return false;
    }
  };

  return {
    account,
    templates,
    loading,
    updateAccount,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
}
