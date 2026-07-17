"use client";

import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCommunications, ComposeCommunicationDto } from "@/hooks/useCommunications";
import { useTenants } from "@/hooks/useTenants";
import { useOwners } from "@/hooks/useOwners";
import { Mail, MessageCircle, ExternalLink, Loader2 } from "lucide-react";

interface ComposeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preselectedTenantId?: string;
  preselectedOwnerId?: string;
}

const TENANT_EMAIL_TEMPLATES = [
  { label: "Rent reminder", body: "Dear [Name],\n\nThis is a friendly reminder that your rent payment is due. Please arrange payment at your earliest convenience.\n\nThank you,\nRental" },
  { label: "Late payment notice", body: "Dear [Name],\n\nWe have not yet received your rent payment for this period. Please contact us urgently to arrange payment and avoid further action.\n\nRental" },
  { label: "Maintenance update", body: "Dear [Name],\n\nWe are writing to update you on the status of your maintenance request. Please contact us if you have any questions.\n\nRental" },
];

const OWNER_EMAIL_TEMPLATES = [
  { label: "Payment update", body: "Dear [Name],\n\nWe wanted to give you an update on rent collection for your property. Please let us know if you have any questions.\n\nThank you,\nRental" },
  { label: "Maintenance approval request", body: "Dear [Name],\n\nA maintenance request has come in for your property that needs your approval before we proceed. Please get back to us at your earliest convenience.\n\nRental" },
  { label: "Statement follow-up", body: "Dear [Name],\n\nFollowing up on your latest owner statement - please let us know if you have any questions about it.\n\nRental" },
];

export function ComposeDrawer({ open, onOpenChange, onSuccess, preselectedTenantId, preselectedOwnerId }: ComposeDrawerProps) {
  const { compose, loading } = useCommunications();
  const { tenants, loading: tenantsLoading } = useTenants();
  const { owners, loading: ownersLoading } = useOwners();

  const [recipientType, setRecipientType] = useState<"tenant" | "owner">(preselectedOwnerId ? "owner" : "tenant");
  const [tenantId, setTenantId] = useState(preselectedTenantId ?? "");
  const [ownerId, setOwnerId] = useState(preselectedOwnerId ?? "");
  const [channel, setChannel] = useState<"email" | "whatsapp">("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [waLink, setWaLink] = useState<string | null>(null);

  const isPreselected = !!preselectedTenantId || !!preselectedOwnerId;
  const templates = recipientType === "owner" ? OWNER_EMAIL_TEMPLATES : TENANT_EMAIL_TEMPLATES;

  useEffect(() => {
    if (open) {
      setRecipientType(preselectedOwnerId ? "owner" : "tenant");
      setTenantId(preselectedTenantId ?? "");
      setOwnerId(preselectedOwnerId ?? "");
      setChannel("email");
      setSubject("");
      setBody("");
      setError("");
      setWaLink(null);
    }
  }, [open, preselectedTenantId, preselectedOwnerId]);

  const applyTemplate = (templateBody: string) => {
    const name = recipientType === "owner"
      ? owners.find((o) => o.id === ownerId)?.full_name
      : tenants.find((t) => t.id === tenantId)?.full_name;
    setBody(name ? templateBody.replace("[Name]", name) : templateBody);
  };

  const handleSubmit = async () => {
    if (recipientType === "tenant" && !tenantId) { setError("Please select a tenant."); return; }
    if (recipientType === "owner" && !ownerId) { setError("Please select an owner."); return; }
    if (!body.trim()) { setError("Message body is required."); return; }
    if (channel === "email" && !subject.trim()) { setError("Subject is required for email."); return; }
    setError("");

    const dto: ComposeCommunicationDto = {
      recipientType,
      ...(recipientType === "tenant" ? { tenantId } : { ownerId }),
      channel, body,
      ...(channel === "email" && subject ? { subject } : {}),
    };

    const result = await compose(dto);
    if (!result.success) { setError(result.error); return; }

    if (result.data.waLink) {
      setWaLink(result.data.waLink);
    } else {
      onSuccess();
      onOpenChange(false);
    }
  };

  const handleOpenWa = () => {
    if (waLink) {
      window.open(waLink, "_blank", "noopener,noreferrer");
      onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Compose Message</DialogTitle>
          <DialogDescription>Send an email or WhatsApp message to a tenant or owner.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2 max-h-[65vh] overflow-y-auto pr-1">
          {/* Send To + Channel share a row - keeps the dialog short enough
              that it never needs to overflow past the footer on smaller
              screens (that overflow, combined with the fixed-position
              footer, was what made the content visually overlap). */}
          <div className={isPreselected ? "" : "grid grid-cols-2 gap-4"}>
            {!isPreselected && (
              <div className="space-y-2">
                <Label>Send To</Label>
                <div className="flex gap-2">
                  <Button type="button" variant={recipientType === "tenant" ? "default" : "outline"} size="sm"
                    onClick={() => { setRecipientType("tenant"); setOwnerId(""); }}>
                    Tenant
                  </Button>
                  <Button type="button" variant={recipientType === "owner" ? "default" : "outline"} size="sm"
                    onClick={() => { setRecipientType("owner"); setTenantId(""); }}>
                    Owner
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Channel</Label>
              <div className="flex gap-2">
                <Button type="button" variant={channel === "email" ? "default" : "outline"} size="sm"
                  className="flex items-center gap-1.5" onClick={() => setChannel("email")}>
                  <Mail className="h-4 w-4" /> Email
                </Button>
                <Button type="button" variant={channel === "whatsapp" ? "default" : "outline"} size="sm"
                  className="flex items-center gap-1.5" onClick={() => setChannel("whatsapp")}>
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </Button>
              </div>
            </div>
          </div>

          {/* Tenant / Owner selector */}
          {recipientType === "tenant" ? (
            <div className="space-y-2">
              <Label htmlFor="tenant-select">Tenant</Label>
              <Select value={tenantId} onValueChange={setTenantId} disabled={tenantsLoading || !!preselectedTenantId}>
                <SelectTrigger id="tenant-select"><SelectValue placeholder="Select a tenant…" /></SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.full_name}
                      {t.activeTenancy && (
                        <span className="text-muted-foreground ml-1 text-xs">
                          - {t.activeTenancy.unit.property.name}, {t.activeTenancy.unit.unit_number}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="owner-select">Owner</Label>
              <Select value={ownerId} onValueChange={setOwnerId} disabled={ownersLoading || !!preselectedOwnerId}>
                <SelectTrigger id="owner-select"><SelectValue placeholder="Select an owner…" /></SelectTrigger>
                <SelectContent>
                  {owners.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Subject + Templates share a row on email */}
          {channel === "email" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Payment Reminder" />
              </div>
              <div className="space-y-2">
                <Label>Use Template</Label>
                <div className="flex flex-wrap gap-2">
                  {templates.map((tpl) => (
                    <Button key={tpl.label} type="button" variant="outline" size="sm" onClick={() => applyTemplate(tpl.body)}>
                      {tpl.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea id="body" rows={7} value={body} onChange={(e) => setBody(e.target.value)}
              placeholder={channel === "whatsapp" ? "Type your WhatsApp message…" : "Type your email body…"} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {waLink && (
            <div className="rounded-md border border-green-300 bg-green-50 p-4 space-y-2">
              <p className="text-sm font-medium text-green-800">Message logged. Open WhatsApp to send it from your device.</p>
              <Button type="button" variant="outline" size="sm"
                className="text-green-700 border-green-400 flex items-center gap-1.5" onClick={handleOpenWa}>
                <ExternalLink className="h-4 w-4" /> Open WhatsApp
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {!waLink && (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {channel === "whatsapp" ? "Log & Open WhatsApp" : "Send Email"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
