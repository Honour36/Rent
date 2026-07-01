"use client";

import { useState } from "react";

import Link from "next/link";

import { Building2, Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Property } from "@/hooks/useProperties";
import { useProperties } from "@/hooks/useProperties";
import { AddPropertyDialog } from "./_components/add-property-dialog";

function getVacancyStatus(property: Property) {
  if (!property.units || property.units.length === 0) {
    return { label: "No units", variant: "outline" as const };
  }
  const vacant = property.units.filter((u) => u.status === "vacant").length;
  if (vacant === 0) return { label: "Fully Occupied", variant: "default" as const };
  return { label: `${vacant} Vacant`, variant: "outline" as const };
}

export default function PropertiesPage() {
  const { properties, loading, error, refetch } = useProperties();
  const [search, setSearch] = useState("");

  const filteredProperties = properties.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) || p.address.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="text-sm text-muted-foreground">Manage your property portfolio</p>
        </div>
        <AddPropertyDialog onSuccess={refetch} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Properties</CardTitle>
          <CardDescription>View occupancy rates and unit statuses across your portfolio.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              className="max-w-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : filteredProperties.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border">
              <Building2 className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">No properties found</p>
                <p className="text-sm text-muted-foreground">Add your first property to get started.</p>
              </div>
              <AddPropertyDialog onSuccess={refetch} />
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Property</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Location</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Owner</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Units</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.map((prop) => {
                    const status = getVacancyStatus(prop);
                    return (
                      <TableRow key={prop.id} className="hover:bg-muted/50">
                        <TableCell className="text-sm font-medium text-foreground">{prop.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="text-foreground">{prop.address}</span>
                            <span className="text-muted-foreground">
                              {prop.suburb} {prop.city}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-foreground">{prop.owner?.full_name ?? "—"}</TableCell>
                        <TableCell className="text-sm text-foreground">{prop.units?.length ?? 0}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/properties/${prop.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
