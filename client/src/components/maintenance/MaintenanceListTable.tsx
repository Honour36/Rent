"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Search, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useMaintenance, MaintenanceRequestDto } from "@/hooks/useMaintenance";
import { LogMaintenanceDialog } from "./LogMaintenanceDialog";

function priorityBadge(priority: string) {
  switch (priority) {
    case "emergency":
      return <Badge variant="destructive">Emergency</Badge>;
    case "high":
      return (
        <Badge className="border-orange-500 bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
          High
        </Badge>
      );
    case "medium":
      return <Badge variant="secondary">Medium</Badge>;
    default:
      return <Badge variant="outline">Low</Badge>;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "open":
      return (
        <Badge className="border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          Open
        </Badge>
      );
    case "in_progress":
      return (
        <Badge className="border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          In Progress
        </Badge>
      );
    case "resolved":
      return (
        <Badge className="border-green-500 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
          Resolved
        </Badge>
      );
    case "closed":
      return <Badge variant="outline">Closed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
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

  const load = useCallback(async () => {
    const result = await listRequests({
      status: statusFilter !== "all" ? statusFilter : undefined,
      priority: priorityFilter !== "all" ? priorityFilter : undefined,
    });
    setRecords(result.records);
    setTotal(result.total);
  }, [listRequests, statusFilter, priorityFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.unit.unit_number.toLowerCase().includes(q) ||
      r.unit.property.name.toLowerCase().includes(q)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Maintenance Requests ({total})</CardTitle>
          <Button onClick={() => setShowLog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Log Request
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title or property…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No maintenance requests found.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              filtered.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/dashboard/maintenance/${r.id}`)}
                >
                  <TableCell className="pl-6 font-medium">{r.title}</TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {r.unit.property.name}
                      <span className="ml-1 text-muted-foreground">· {r.unit.unit_number}</span>
                    </span>
                  </TableCell>
                  <TableCell>{priorityBadge(r.priority)}</TableCell>
                  <TableCell>{statusBadge(r.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(r.created_at), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.logger.full_name ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>

      <LogMaintenanceDialog
        open={showLog}
        onOpenChange={setShowLog}
        onCreated={() => {
          setShowLog(false);
          load();
        }}
      />
    </Card>
  );
}
