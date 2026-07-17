"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useMaintenance, CreateMaintenanceDto } from "@/hooks/useMaintenance";
import { useProperties } from "@/hooks/useProperties";

interface LogMaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  /** Pre-fill a specific unit - used when logging from a unit detail page */
  prefilledUnitId?: string;
}

export function LogMaintenanceDialog({
  open,
  onOpenChange,
  onCreated,
  prefilledUnitId,
}: LogMaintenanceDialogProps) {
  const { createRequest, loading } = useMaintenance();
  const { properties } = useProperties();

  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [unitId, setUnitId] = useState(prefilledUnitId ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<CreateMaintenanceDto["priority"]>("medium");
  const [errorMsg, setErrorMsg] = useState("");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedPropertyId("");
      setUnitId(prefilledUnitId ?? "");
      setTitle("");
      setDescription("");
      setPriority("medium");
      setErrorMsg("");
    }
  }, [open, prefilledUnitId]);

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);
  const availableUnits = selectedProperty?.units ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!unitId) {
      setErrorMsg("Please select a unit.");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Title is required.");
      return;
    }

    const result = await createRequest({
      unitId,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    });

    if (!result.success) {
      setErrorMsg(result.error ?? "Failed to log request.");
      return;
    }

    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Log Maintenance Request</DialogTitle>
          <DialogDescription>
            Record a new maintenance issue for a unit. The request will be created with status
            Open.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Property selector */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Property</Label>
              <div className="col-span-3">
                <Select
                  value={selectedPropertyId}
                  onValueChange={(v) => {
                    setSelectedPropertyId(v);
                    setUnitId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property…" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Unit selector */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Unit</Label>
              <div className="col-span-3">
                <Select
                  value={unitId}
                  onValueChange={setUnitId}
                  disabled={!selectedPropertyId && !prefilledUnitId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUnits.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.unit_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Title</Label>
              <Input
                className="col-span-3"
                placeholder="e.g. Leaking kitchen tap"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Priority */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Priority</Label>
              <div className="col-span-3">
                <Select
                  value={priority}
                  onValueChange={(v) => setPriority(v as CreateMaintenanceDto["priority"])}
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
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="pt-2 text-right">Description</Label>
              <Textarea
                className="col-span-3 min-h-[80px]"
                placeholder="Describe the issue…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {errorMsg && <p className="col-span-4 text-sm text-destructive">{errorMsg}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Logging…" : "Log Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
