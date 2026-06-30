import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Unit } from "@/hooks/useProperties";

interface UnitCardProps {
  unit: Unit;
}

export function UnitCard({ unit }: UnitCardProps) {
  let badgeVariant: "default" | "outline" | "destructive" = "default";
  let statusLabel = "Occupied";
  let badgeColorClass = ""; // Custom color if needed

  if (unit.status === "vacant") {
    badgeVariant = "outline";
    statusLabel = "Vacant";
    badgeColorClass = "border-amber-500 text-amber-500";
  } else if (unit.status === "maintenance") {
    badgeVariant = "destructive";
    statusLabel = "Maintenance";
  } else {
    // default (primary) for occupied
    statusLabel = "Occupied";
    badgeColorClass = "bg-green-600 hover:bg-green-600/80";
  }

  // Find active tenancy if it exists
  const activeTenancy = unit.tenancies?.find(t => t.status === "active");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Unit {unit.unit_number}</CardTitle>
        <Badge variant={badgeVariant} className={badgeColorClass}>
          {statusLabel}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="mt-2 text-2xl font-bold">
          {unit.currency === "USD" ? "$" : "ZiG "}
          {unit.rent_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <span className="text-sm font-normal text-muted-foreground"> /mo</span>
        </div>
        
        <div className="mt-4 flex flex-col gap-1 text-sm text-muted-foreground">
          {unit.status === "occupied" && activeTenancy ? (
            <>
              <div>
                <span className="font-medium text-foreground">Tenant:</span>{" "}
                {/* Fallback to something if tenant name isn't joined yet, or assume it is */}
                {activeTenancy.tenant_id ? "Tenant (ID)" : "Unknown"}
              </div>
              <div>
                <span className="font-medium text-foreground">Next Due:</span>{" "}
                {/* Fallback next due date logic for mock */}
                1st of Next Month
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
