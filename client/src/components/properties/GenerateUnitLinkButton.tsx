"use client";

import { useState } from "react";
import { Copy, Check, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

interface Props {
  unitId: string;
  size?: "sm" | "default";
}

export function GenerateUnitLinkButton({ unitId, size = "sm" }: Props) {
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // If we already have the link, just copy it
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      return;
    }

    // Generate the link
    setLoading(true);
    setError("");
    const res = await apiClient<{ url: string; token: string }>(
      "/applications/generate-link",
      { method: "POST", data: { unitId } }
    );
    setLoading(false);

    if (res.success && (res as any).data?.token) {
      const token = (res as any).data.token;
      const url = `${window.location.origin}/application/${token}`;
      setLink(url);
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      setError((res as any).error || "Failed to generate link");
    }
  };

  if (loading) {
    return (
      <Button variant="outline" size={size} className="gap-1.5" disabled>
        <Loader2 className="h-3 w-3 animate-spin" />
        Generating…
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <Button
        variant={copied ? "secondary" : "outline"}
        size={size}
        className="gap-1.5"
        onClick={handleClick}
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-600" />
        ) : link ? (
          <Copy className="h-3 w-3" />
        ) : (
          <Link2 className="h-3 w-3" />
        )}
        {copied ? "Copied!" : link ? "Copy Link" : "Get App Link"}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
