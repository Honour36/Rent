"use client";

import { useState } from "react";
import { Copy, Check, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

interface Props { unitId: string }

export function GenerateUnitLinkButton({ unitId }: Props) {
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (link) { copyLink(); return; }
    setLoading(true);
    const res = await apiClient<{ url: string; token: string }>("/applications/generate-link", {
      method: "POST",
      data: { unitId },
    });
    setLoading(false);
    if (res.success) setLink((res as any).data.url);
  };

  const copyLink = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <Button variant="outline" size="sm" className="h-7 text-xs gap-1" disabled><Loader2 className="h-3 w-3 animate-spin" />Generating…</Button>;

  if (link) return (
    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); copyLink(); }}>
      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied!" : "Copy App Link"}
    </Button>
  );

  return (
    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={generate}>
      <Link2 className="h-3 w-3" />
      Get App Link
    </Button>
  );
}
