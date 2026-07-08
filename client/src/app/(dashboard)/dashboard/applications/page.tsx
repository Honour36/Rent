"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ClipboardList, Clock, CheckCircle2, XCircle, MessageSquare,
  Search, ExternalLink, Building2, Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useApplications } from "@/hooks/useApplications";
import { GenerateLinkDialog } from "./_components/generate-link-dialog";
import { apiClient } from "@/lib/api-client";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  pending:  { label: "Pending",   variant: "secondary",    icon: Clock },
  approved: { label: "Approved",  variant: "default",      icon: CheckCircle2 },
  rejected: { label: "Rejected",  variant: "destructive",  icon: XCircle },
  more_info:{ label: "More Info", variant: "outline",      icon: MessageSquare },
};

export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [deleteApp, setDeleteApp] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const { applications, loading, error, refetch } = useApplications(
    statusFilter !== "all" ? statusFilter : undefined,
  );

  const filtered = applications.filter(
    (a) =>
      a.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
      a.unit.property.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deleteApp) return;
    setDeleting(true);
    const res = await apiClient(`/applications/${deleteApp.id}`, { method: "DELETE" });
    if (res.success) {
      toast.success("Application deleted.");
      refetch();
    } else {
      toast.error("Could not delete", { description: (res as any).error });
    }
    setDeleteApp(null);
    setDeleting(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-sm text-muted-foreground">Review and action incoming tenant applications</p>
        </div>
        <GenerateLinkDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>Click an application to review details and update its status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by applicant or property…" className="w-full sm:w-72"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="more_info">More Info</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading applications…</p>
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">Unable to load applications.</p>
          ) : filtered.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">No applications</p>
                <p className="text-xs text-muted-foreground">Generate an application link and share it with prospective tenants.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs uppercase text-muted-foreground">Applicant</TableHead>
                    <TableHead className="text-xs uppercase text-muted-foreground">Property / Unit</TableHead>
                    <TableHead className="text-xs uppercase text-muted-foreground">Contact</TableHead>
                    <TableHead className="text-xs uppercase text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs uppercase text-muted-foreground">Submitted</TableHead>
                    <TableHead className="text-right text-xs uppercase text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((app) => {
                    const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.pending;
                    const Icon = cfg.icon;
                    return (
                      <TableRow key={app.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{app.applicant_name}</span>
                            {app.applicant_email && (
                              <span className="text-xs text-muted-foreground">{app.applicant_email}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>{app.unit.property.name}</span>
                            <span className="text-muted-foreground">· {app.unit.unit_number}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {app.applicant_phone ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={cfg.variant} className="flex items-center gap-1 w-fit">
                            <Icon className="h-3 w-3" />{cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(app.created_at).toLocaleDateString("en-ZW", { day: "2-digit", month: "short", year: "numeric" })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/applications/${app.id}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                            {app.status !== "approved" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setDeleteApp(app)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
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

      <AlertDialog open={!!deleteApp} onOpenChange={(v) => { if (!v) setDeleteApp(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              Delete the application from <strong>{deleteApp?.applicant_name}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
