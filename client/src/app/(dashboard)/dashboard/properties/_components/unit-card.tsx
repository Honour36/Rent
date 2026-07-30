"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import type { Unit } from "@/hooks/useProperties";

interface UnitCardProps {
  unit: Unit;
  onChanged?: () => void;
}

export function UnitCard({ unit, onChanged }: UnitCardProps) {
  const [updating, setUpdating] = useState(false);
  // Local optimistic copy so the switch flips instantly - the underlying
  // `unit` prop only catches up once the parent refetches.
  const [status, setStatus] = useState(unit.status);

  let badgeVariant: "default" | "outline" | "destructive" = "default";
  let statusLabel = "Occupied";
  let badgeColorClass = ""; // Custom color if needed

  if (status === "vacant") {
    badgeVariant = "outline";
    statusLabel = "Vacant";
    badgeColorClass = "border-amber-500 text-amber-500";
  } else if (status === "maintenance") {
    badgeVariant = "destructive";
    statusLabel = "Maintenance";
  } else {
    // default (primary) for occupied
    statusLabel = "Occupied";
    badgeColorClass = "bg-green-600 hover:bg-green-600/80";
  }

  // Find active tenancy if it exists
  const activeTenancy = unit.tenancies?.find(t => t.status === "active");
  const isPrimaryUnit = unit.unit_number === "Main Unit";

  const toggleStatus = async (checked: boolean) => {
    const next = checked ? "occupied" : "vacant";
    const previous = status;
    setStatus(next); // optimistic
    setUpdating(true);
    const res = await apiClient(`/units/${unit.id}`, { method: "PATCH", data: { status: next } });
    setUpdating(false);
    if (!res.success) {
      setStatus(previous);
      toast.error("Could not update status", { description: (res as any).error || "Please try again." });
      return;
    }
    if (next === "vacant" && activeTenancy) {
      // A manual override, not a move-out - flag it so nobody mistakes this
      // for the tenant having actually left (migrated data can carry a
      // status that no longer matches the tenancy record; this is the
      // escape hatch for that, not a replacement for ending a tenancy).
      toast.info("Marked vacant", {
        description: "This unit still has an active tenancy on record - end it from Tenants if the tenant has actually moved out.",
        duration: 6000,
      });
    } else {
      toast.success(`Marked ${next}.`);
    }
    onChanged?.();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{isPrimaryUnit ? "Rent & Occupancy" : `Unit ${unit.unit_number}`}</CardTitle>
        <Badge variant={badgeVariant} className={badgeColorClass}>
          {statusLabel}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="mt-2 text-2xl font-bold">
          {unit.rent_amount == null ? (
            <span className="text-muted-foreground text-base font-normal">Rent not set - edit property to add it</span>
          ) : (
            <>
              {unit.currency === "USD" ? "$" : "ZiG "}
              {unit.rent_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-normal text-muted-foreground"> /mo</span>
            </>
          )}
        </div>

        {status !== "maintenance" && (
          <div className="mt-3 flex items-center gap-2">
            <Switch
              id={`unit-status-${unit.id}`}
              size="sm"
              checked={status === "occupied"}
              disabled={updating}
              onCheckedChange={toggleStatus}
            />
            <Label htmlFor={`unit-status-${unit.id}`} className="text-xs text-muted-foreground font-normal cursor-pointer">
              Mark as {status === "occupied" ? "vacant" : "occupied"}
            </Label>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-1 text-sm text-muted-foreground">
          {status === "occupied" && activeTenancy ? (
            <>
              <div>
                <span className="font-medium text-foreground">Tenant:</span>{" "}
                {activeTenancy.tenant?.full_name ?? "-"}
              </div>
              <div>
                <span className="font-medium text-foreground">Lease from:</span>{" "}
                {activeTenancy.lease_start
                  ? new Date(activeTenancy.lease_start).toLocaleDateString("en-ZW", { day: "2-digit", month: "short", year: "numeric" })
                  : "-"}
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="font-medium text-foreground">Details:</span>{" "}
                {unit.bedrooms || 0} Bed, {unit.bathrooms || 0} Bath
              </div>
              <div className="opacity-0">Placeholder</div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
