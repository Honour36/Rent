"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Search,
  ExternalLink,
  Building2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApplications } from "@/hooks/useApplications";
import { GenerateLinkDialog } from "./_components/generate-link-dialog";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }
> = {
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  approved: { label: "Approved", variant: "default", icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
  more_info: { label: "More Info", variant: "outline", icon: MessageSquare },
};

export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { applications, loading, error, refetch } = useApplications(
    statusFilter !== "all" ? statusFilter : undefined,
  );

  const filtered = applications.filter(
    (a) =>
      a.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
      a.unit.property.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-sm text-muted-foreground">
            Review and action incoming tenant applications
          </p>
        </div>
        <GenerateLinkDialog onSuccess={refetch} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Application Queue
          </CardTitle>
          <CardDescription>
            All submitted applications — click any row to open the vetting view.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applicant or property..."
                className="max-w-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="more_info">More Info</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : filtered.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border">
              <ClipboardList className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">No applications found</p>
                <p className="text-sm text-muted-foreground">
                  Generate a shareable link to send to applicants.
                </p>
              </div>
              <GenerateLinkDialog onSuccess={refetch} />
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Applicant
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Property / Unit
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Submitted
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                      Reviewed by
                    </TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((app) => {
                    const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.pending;
                    const StatusIcon = cfg.icon;
                    const hasData =
                      app.applicant_name && app.applicant_name.length > 0;
                    return (
                      <TableRow key={app.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium text-foreground">
                          {hasData ? (
                            <div className="flex flex-col">
                              <span>{app.applicant_name}</span>
                              {app.applicant_phone && (
                                <span className="text-xs text-muted-foreground">
                                  {app.applicant_phone}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="italic text-muted-foreground text-sm">
                              Not yet submitted
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="font-medium text-foreground">
                              {app.unit.property.name}
                            </span>
                            <span className="text-muted-foreground">
                              Unit {app.unit.unit_number}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {hasData
                            ? new Date(app.submitted_at).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={cfg.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {app.reviewer?.full_name ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/applications/${app.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              Review
                              <ExternalLink className="h-3 w-3" />
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
