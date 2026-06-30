import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface Agent {
  id: string;
  email: string;
  role: 'admin' | 'senior_agent' | 'junior_agent';
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AgentInvite {
  id: string;
  email: string;
  role: 'admin' | 'senior_agent' | 'junior_agent';
  token: string;
  expires_at: string;
  created_at: string;
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [invites, setInvites] = useState<AgentInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    setLoading(true);
    const res = await apiClient<{ agents: Agent[], invites: AgentInvite[] }>("/agents");
    if (res.success) {
      setAgents(res.data.agents);
      setInvites(res.data.invites);
    } else {
      toast.error(res.error || "Error fetching agents");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const inviteAgent = async (data: { email: string, role: string }) => {
    const res = await apiClient("/agents/invite", { method: 'POST', data });
    if (res.success) {
      toast.success("An invitation email has been sent.");
      fetchAgents();
      return true;
    } else {
      toast.error(res.error || "Error inviting agent");
      return false;
    }
  };

  const updateAgent = async (id: string, data: { role?: string, is_active?: boolean }) => {
    const res = await apiClient(`/agents/${id}`, { method: 'PATCH', data });
    if (res.success) {
      toast.success("Agent details updated successfully.");
      fetchAgents();
      return true;
    } else {
      toast.error(res.error || "Error updating agent");
      return false;
    }
  };

  return {
    agents,
    invites,
    loading,
    fetchAgents,
    inviteAgent,
    updateAgent
  };
}
