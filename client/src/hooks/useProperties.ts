import { useEffect, useState } from "react";

import { apiClient } from "@/lib/api-client";

export interface Unit {
  id: string;
  property_id: string;
  unit_number: string;
  bedrooms?: number;
  bathrooms?: number;
  status: "vacant" | "occupied" | "maintenance";
  rent_amount: number;
  currency: "ZiG" | "USD";
  tenancies?: any[];
}

export interface Property {
  id: string;
  name: string;
  address: string;
  suburb?: string;
  city?: string;
  type: string;
  owners?: { full_name: string };
  units?: Unit[];
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProperties = async () => {
    setLoading(true);
    const res = await apiClient<Property[]>("/properties");
    if (res.success) {
      setProperties(res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return { properties, loading, error, refetch: fetchProperties };
}

export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProperty = async () => {
    setLoading(true);
    const res = await apiClient<Property>(`/properties/${id}`);
    if (res.success) {
      setProperty(res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  return { property, loading, error, refetch: fetchProperty };
}

export async function createProperty(data: any) {
  return await apiClient<Property>("/properties", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createUnit(data: any) {
  return await apiClient<Unit>("/units", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
