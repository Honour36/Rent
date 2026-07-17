"use client";

import { useState } from "react";
import { Copy, Link2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import type { GenerateLinkResult } from "@/hooks/useApplications";

interface Props {
  onSuccess?: () => void;
}

export function GenerateLinkDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [unitId, setUnitId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateLinkResult | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setUnitId("");
    setError("");
    setResult(null);
    setCopied(false);
  };

  const handleGenerate = async () => {
    if (!unitId.trim()) {
      setError("Please enter a Unit ID.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await apiClient<GenerateLinkResult>("/applications/generate-link", {
      method: "POST",
      data: { unitId: unitId.trim() },
    });
    if (res.success) {
      setResult(res.data);
      onSuccess?.();
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  const handleCopy = async () => {
    if (!result?.url) return;
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Link2 className="h-4 w-4" />
          Generate Application Link
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Application Link</DialogTitle>
          <DialogDescription>
            Create a unique shareable link for a unit. Send it to the prospective
            tenant - they fill the form without logging in.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unitId">Unit ID</Label>
              <Input
                id="unitId"
                placeholder="Paste the unit UUID here"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You can find the Unit ID on the property detail page (Unit row → copy
                ID).
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Link
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                Unit
              </p>
              <p className="font-medium text-foreground">
                {result.unit.property.name} - Unit {result.unit.unit_number}
              </p>
              <p className="text-sm text-muted-foreground">
                {Number(result.unit.rent_amount).toLocaleString()} {result.unit.currency}
                /mo
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Shareable Link</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={result.url}
                  className="text-xs font-mono"
                />
                <Button
                  size="icon"
                  variant={copied ? "default" : "outline"}
                  onClick={handleCopy}
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {copied ? "✓ Copied to clipboard!" : "Send this link to the applicant via WhatsApp or email."}
              </p>
            </div>

            <DialogFooter>
              <Button onClick={() => { setOpen(false); reset(); }}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
