"use client";

import { useEffect, useState } from "react";
import { use } from "react";

import { useMaintenance, MaintenanceRequestDto } from "@/hooks/useMaintenance";
import { MaintenanceDetailCard } from "@/components/maintenance/MaintenanceDetailCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MaintenanceDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { getRequest, loading } = useMaintenance();
  const [request, setRequest] = useState<MaintenanceRequestDto | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getRequest(id).then((data) => {
      if (!data) setNotFound(true);
      else setRequest(data);
    });
  }, [id, getRequest]);

  if (loading && !request) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Maintenance request not found.
      </div>
    );
  }

  if (!request) return null;

  return (
    <MaintenanceDetailCard
      request={request}
      onUpdated={(updated) => setRequest(updated)}
    />
  );
}
