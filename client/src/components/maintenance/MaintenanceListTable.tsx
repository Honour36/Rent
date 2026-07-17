"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Search, Filter, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useMaintenance, MaintenanceRequestDto } from "@/hooks/useMaintenance";
import { LogMaintenanceDialog } from "./LogMaintenanceDialog";
import { apiClient } from "@/lib/api-client";

function priorityBadge(priority: string) {
  switch (priority) {
    case "emergency": return <Badge variant="destructive">Emergency</Badge>;
    case "high": return <Badge className="border-orange-500 bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">High</Badge>;
    case "medium": return <Badge variant="secondary">Medium</Badge>;
    default: return <Badge variant="outline">Low</Badge>;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "open": return <Badge className="border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">Open</Badge>;
    case "in_progress": return <Badge className="border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">In Progress</Badge>;
    case "resolved": return <Badge className="border-green-500 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">Resolved</Badge>;
    case "closed": return <Badge variant="outline">Closed</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

function EditMaintenanceDialog({ record, onClose, onSaved }: { record: MaintenanceRequestDto; onClose: () => void; onSaved: () => void }) {
  const { updateRequest, loading } = useMaintenance();
  const [status, setStatus] = useState(record.status);
  const [priority, setPriority] = useState(record.priority);
  const [title, setTitle] = useState(record.title);
  const [description, setDescription] = useState(record.description ?? "");

  const save = async () => {
    await updateRequest(record.id, { status, priority, title, description });
    onSaved();
    onClose();
  };

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>Edit Maintenance Request</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Title</Label>
            <Input className="col-span-3" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Status</Label>
            <div className="col-span-3">
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Priority</Label>
            <div className="col-span-3">
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Description</Label>
            <Input className="col-span-3" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MaintenanceListTable() {
  const router = useRouter();
  const { listRequests, loading } = useMaintenance();
  const [records, setRecords] = useState<MaintenanceRequestDto[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showLog, setShowLog] = useState(false);
  const [editRecord, setEditRecord] = useState<MaintenanceRequestDto | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<MaintenanceRequestDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const result = await listRequests({
      status: statusFilter !== "all" ? statusFilter : undefined,
      priority: priorityFilter !== "all" ? priorityFilter : undefined,
    });
    setRecords(result.records);
    setTotal(result.total);
  }, [listRequests, statusFilter, priorityFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteRecord) return;
    setDeleting(true);
    await apiClient(`/maintenance/${deleteRecord.id}`, { method: "DELETE" });
    setDeleteRecord(null);
    setDeleting(false);
    load();
  };

  const filtered = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.title.toLowerCase().includes(q) || r.unit.unit_number.toLowerCase().includes(q) || r.unit.property.name.toLowerCase().includes(q);
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Maintenance Requests ({total})</CardTitle>
            <Button onClick={() => setShowLog(true)}>
              <Plus className="mr-2 h-4 w-4" />Log Request
            </Button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by title or property…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Title</TableHead>
                <TableHead>Property / Unit</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Logged</TableHead>
                <TableHead>Logged By</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">Loading…</TableCell></TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No maintenance requests found.</TableCell></TableRow>
              )}
              {!loading && filtered.map((r) => (
                <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/dashboard/maintenance/${r.id}`)}>
                  <TableCell className="pl-6 font-medium">{r.title}</TableCell>
                  <TableCell>
                    <span className="text-sm">{r.unit.property.name}
                      <span className="ml-1 text-muted-foreground">· {r.unit.unit_number}</span>
                    </span>
                  </TableCell>
                  <TableCell>{priorityBadge(r.priority)}</TableCell>
                  <TableCell>{statusBadge(r.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(r.created_at), "dd MMM yyyy")}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.logger.full_name ?? "-"}</TableCell>
                  <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditRecord(r)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteRecord(r)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <LogMaintenanceDialog open={showLog} onOpenChange={setShowLog} onCreated={() => { setShowLog(false); load(); }} />

      {editRecord && (
        <EditMaintenanceDialog record={editRecord} onClose={() => setEditRecord(null)} onSaved={load} />
      )}

      <AlertDialog open={!!deleteRecord} onOpenChange={(v) => { if (!v) setDeleteRecord(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Maintenance Request</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{deleteRecord?.title}</strong>? This cannot be undone.
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
    </>
  );
}
