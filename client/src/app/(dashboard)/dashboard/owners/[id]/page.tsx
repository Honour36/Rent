"use client";

import { use, useState } from "react";
import { Building2, UserCheck, Phone, Mail, Landmark, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOwner } from "@/hooks/useOwners";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OwnerDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { owner, loading, error } = useOwner(id);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading owner details...</p>
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-destructive">{error || "Owner not found"}</p>
        <Link href="/dashboard/owners">
          <Button variant="outline">Back to Owners</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/owners">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="flex items-center text-2xl font-bold">
            {owner.full_name}
            {owner.is_diaspora && (
              <Badge variant="secondary" className="ml-3">
                Diaspora
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">Owner Profile</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{owner.email || "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{owner.phone || "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Bank Name</p>
                <p className="mt-1">{owner.bank_name || "—"}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Account Number</p>
                <p className="mt-1">{owner.bank_account || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Properties Under Management
          </CardTitle>
          <CardDescription>
            Properties owned by {owner.full_name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Note: In a complete implementation, this would list the actual properties using owner.properties relation. 
              Currently we just have property count in standard query, but getById fetches properties(*). */}
          {owner.properties && owner.properties.length > 0 ? (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Name</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Address</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Type</TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {owner.properties.map((prop: any) => (
                    <TableRow key={prop.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm font-medium text-foreground">{prop.name}</TableCell>
                      <TableCell className="text-sm text-foreground">{prop.address}, {prop.city}</TableCell>
                      <TableCell className="text-sm text-foreground capitalize">{prop.type}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/properties/${prop.id}`}>
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
          ) : (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
              <p className="text-sm text-muted-foreground">No properties under management.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Statement History
          </CardTitle>
          <CardDescription>
            Monthly owner statements for {owner.full_name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
            <p className="text-sm text-muted-foreground">Coming in Phase 6 — Reports & Owner Statements</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
