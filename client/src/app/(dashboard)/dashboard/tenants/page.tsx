"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTenants } from "@/hooks/useTenants";
import { AddTenantDialog } from "./_components/add-tenant-dialog";

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function TenantsPage() {
  const { tenants, loading, error, refetch } = useTenants();
  const [search, setSearch] = useState("");

  const filteredTenants = tenants.filter((t) =>
    t.full_name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tenants</h1>
          <p className="text-sm text-muted-foreground">Manage all tenant profiles and histories</p>
        </div>
        <AddTenantDialog onSuccess={refetch} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
          <CardDescription>View tenant profiles, current leases, and payment histories.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tenants..."
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
          ) : filteredTenants.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border">
              <Users className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">No tenants found</p>
                <p className="text-sm text-muted-foreground">
                  Add a tenant manually or approve an application to create one.
                </p>
              </div>
              <AddTenantDialog onSuccess={refetch} />
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Name
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Contact
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Current Property / Unit
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Tenancy
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Arrears
                    </TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((tenant) => {
                    const t = tenant.activeTenancy;
                    return (
                      <TableRow key={tenant.id} className="hover:bg-muted/50">
                        <TableCell className="text-sm font-medium text-foreground">
                          {tenant.full_name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="text-foreground">{tenant.email ?? "—"}</span>
                            <span className="text-muted-foreground">{tenant.phone ?? "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {t ? (
                            <div className="flex flex-col">
                              <span className="font-medium">{t.unit.property.name}</span>
                              <span className="text-muted-foreground">Unit {t.unit.unit_number}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {t ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="outline">No Tenancy</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {tenant.hasArrears ? (
                            <Badge variant="destructive">Arrears</Badge>
                          ) : (
                            <Badge variant="secondary">Clear</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/tenants/${tenant.id}`}>
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
