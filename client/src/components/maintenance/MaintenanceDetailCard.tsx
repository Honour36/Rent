"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { useMaintenance, MaintenanceRequestDto, UpdateMaintenanceDto } from "@/hooks/useMaintenance";

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

interface MaintenanceDetailCardProps {
  request: MaintenanceRequestDto;
  onUpdated: (updated: MaintenanceRequestDto) => void;
}

export function MaintenanceDetailCard({ request, onUpdated }: MaintenanceDetailCardProps) {
  const { updateRequest, loading } = useMaintenance();

  const [status, setStatus] = useState<UpdateMaintenanceDto["status"]>(request.status);
  const [priority, setPriority] = useState<UpdateMaintenanceDto["priority"]>(request.priority);
  const [cost, setCost] = useState(request.cost !== null ? String(request.cost) : "");
  const [description, setDescription] = useState(request.description ?? "");
  const [errorMsg, setErrorMsg] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setErrorMsg("");
    setSaved(false);

    const patch: UpdateMaintenanceDto = {
      status,
      priority,
      description: description || undefined,
      cost: cost !== "" ? parseFloat(cost) : undefined,
    };

    const result = await updateRequest(request.id, patch);
    if (!result.success) {
      setErrorMsg(result.error ?? "Failed to save changes.");
      return;
    }
    setSaved(true);
    onUpdated(result.data);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Back link + header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/maintenance">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Requests
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{request.title}</h1>
          {statusBadge(request.status)}
          {priorityBadge(request.priority)}
        </div>
        <p className="text-sm text-muted-foreground">
          {request.unit.property.name} · {request.unit.unit_number} · Logged{" "}
          {format(new Date(request.created_at), "dd MMM yyyy")} by{" "}
          {request.logger.full_name ?? "unknown"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — details */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description of the issue…"
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>

          {/* Tenant info (if linked to a tenancy) */}
          {request.tenancy && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tenant</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm">
                <p className="font-medium">{request.tenancy.tenant.full_name}</p>
                {request.tenancy.tenant.phone && (
                  <p className="text-muted-foreground">{request.tenancy.tenant.phone}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right — controls */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status &amp; Controls</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as UpdateMaintenanceDto["status"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(v) => setPriority(v as UpdateMaintenanceDto["priority"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Label>Cost (for owner statement deduction)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    className="pl-7"
                    placeholder="0.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                  />
                </div>
              </div>

              {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
              {saved && <p className="text-sm text-green-600">Changes saved.</p>}

              <Button onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving…" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Meta info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property</span>
                <span className="font-medium">{request.unit.property.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit</span>
                <span className="font-medium">{request.unit.unit_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Logged by</span>
                <span className="font-medium">{request.logger.full_name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Logged on</span>
                <span className="font-medium">
                  {format(new Date(request.created_at), "dd MMM yyyy")}
                </span>
              </div>
              {request.resolved_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolved on</span>
                  <span className="font-medium">
                    {format(new Date(request.resolved_at), "dd MMM yyyy")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
