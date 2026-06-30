"use client";

import { use } from "react";
import Link from "next/link";
import { Building2, ChevronLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/hooks/useProperties";
import { AddUnitDialog } from "../_components/add-unit-dialog";
import { UnitCard } from "../_components/unit-card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PropertyDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const { property, loading, error, refetch } = useProperty(id);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
        <p className="text-sm text-destructive">{error || "Property not found"}</p>
        <Link href="/dashboard/properties">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Button>
        </Link>
      </div>
    );
  }

  const vacantCount = property.units?.filter(u => u.status === "vacant").length || 0;
  const occupiedCount = property.units?.filter(u => u.status === "occupied").length || 0;
  const maintenanceCount = property.units?.filter(u => u.status === "maintenance").length || 0;
  const totalUnits = property.units?.length || 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/properties">
          <Button variant="ghost" size="icon-sm">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{property.name}</h1>
          <p className="text-sm text-muted-foreground">
            {property.address} {property.suburb ? `, ${property.suburb}` : ""} {property.city ? `, ${property.city}` : ""}
          </p>
        </div>
        <div className="ml-auto">
          <AddUnitDialog propertyId={id} onSuccess={refetch} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Units</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{occupiedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vacant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{vacantCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{maintenanceCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Units</h2>
        {(!property.units || property.units.length === 0) ? (
          <div className="flex h-48 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border">
            <Building2 className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">No units found</p>
              <p className="text-sm text-muted-foreground">Add your first unit to this property.</p>
            </div>
            <AddUnitDialog propertyId={id} onSuccess={refetch} />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {property.units.map((unit) => (
              <UnitCard key={unit.id} unit={unit} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
