"use client";

import { useState } from "react";

import Link from "next/link";

import { Plus, Search, UserCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOwners } from "@/hooks/useOwners";
import { AddOwnerDialog } from "./_components/add-owner-dialog";

export default function OwnersPage() {
  const { owners, loading, error, refetch } = useOwners();
  const [search, setSearch] = useState("");

  const filteredOwners = owners.filter((o) => o.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Owners</h1>
          <p className="text-sm text-muted-foreground">Manage property owner profiles and bank details</p>
        </div>
        <AddOwnerDialog onSuccess={refetch} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Owners</CardTitle>
          <CardDescription>View and manage all property owners in your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search owners..."
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
          ) : filteredOwners.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border">
              <UserCheck className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">No owners found</p>
                <p className="text-sm text-muted-foreground">Add a property owner to get started.</p>
              </div>
              <AddOwnerDialog onSuccess={refetch} />
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Name</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Contact</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Properties</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Bank Details</TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOwners.map((owner) => (
                    <TableRow key={owner.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm font-medium text-foreground">
                        {owner.full_name}
                        {owner.is_diaspora && (
                          <Badge variant="secondary" className="ml-2">
                            Diaspora
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="text-foreground">{owner.email ?? "—"}</span>
                          <span className="text-muted-foreground">{owner.phone ?? "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{owner.properties?.[0]?.count ?? 0}</TableCell>
                      <TableCell>
                        {owner.bank_name ? (
                          <Badge variant="default">Complete</Badge>
                        ) : (
                          <Badge variant="outline">Missing</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/owners/${owner.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
