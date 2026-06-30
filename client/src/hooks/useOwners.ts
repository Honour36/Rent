import { useEffect, useState } from "react";

import { apiClient } from "@/lib/api-client";

export interface Owner {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  bank_name: string;
  bank_account: string;
  is_diaspora: boolean;
  properties?: any[];
}

export function useOwners() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOwners = async () => {
    setLoading(true);
    const res = await apiClient<Owner[]>("/owners");
    if (res.success) {
      setOwners(res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  return { owners, loading, error, refetch: fetchOwners };
}

export function useOwner(id: string) {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOwner = async () => {
    setLoading(true);
    const res = await apiClient<Owner>(`/owners/${id}`);
    if (res.success) {
      setOwner(res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      fetchOwner();
    }
  }, [id]);

  return { owner, loading, error, refetch: fetchOwner };
}
