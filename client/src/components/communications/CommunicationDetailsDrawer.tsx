"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { CommunicationDto, useCommunications } from "@/hooks/useCommunications";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit2, Check, X, Mail, MessageCircle } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

interface CommunicationDetailsDrawerProps {
  id: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

export function CommunicationDetailsDrawer({
  id,
  onClose,
  onUpdate,
}: CommunicationDetailsDrawerProps) {
  const { getCommunication, updateCommunication, deleteCommunication } = useCommunications();
  const [data, setData] = useState<CommunicationDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  
  // Edit state
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (id) {
      fetchData(id);
    } else {
      setData(null);
      setEditing(false);
    }
  }, [id]);

  const fetchData = async (commId: string) => {
    setLoading(true);
    const result = await getCommunication(commId);
    if (result) {
      setData(result);
      setSubject(result.subject || "");
      setBody(result.body || "");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!id || !data) return;
    setLoading(true);
    const res = await updateCommunication(id, { subject, body });
    setLoading(false);
    
    if (res.success) {
      toast.success("Log updated successfully");
      setData(res.data as CommunicationDto);
      setEditing(false);
      onUpdate();
    } else {
      toast.error(res.error || "Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this communication log? This action cannot be undone.")) return;
    
    setLoading(true);
    const res = await deleteCommunication(id);
    setLoading(false);
    
    if (res.success) {
      toast.success("Log deleted");
      onUpdate();
      onClose();
    } else {
      toast.error(res.error || "Failed to delete");
    }
  };

  return (
    <Sheet open={!!id} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle>Communication Details</SheetTitle>
            {data && !editing && (
              <div className="flex items-center gap-2 mr-6">
                <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <SheetDescription>
            {editing 
              ? "Edit the internal record of this communication." 
              : "View the contents and metadata of this message."}
          </SheetDescription>
        </SheetHeader>

        {loading && !data ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : data ? (
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
              <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                <span className="text-muted-foreground">Channel:</span>
                <div>
                  {data.channel === "email" ? (
                    <Badge variant="outline" className="gap-1 bg-background">
                      <Mail className="h-3 w-3" /> Email
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-green-600 border-green-300 bg-background">
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                <span className="text-muted-foreground">Recipient:</span>
                <span className="font-medium">
                  {data.tenant?.full_name ?? data.owner?.full_name ?? "Unknown"}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                <span className="text-muted-foreground">Sent By:</span>
                <span>{data.sender?.full_name || "System"}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                <span className="text-muted-foreground">Date:</span>
                <span>{format(new Date(data.sent_at), "dd MMMM yyyy, HH:mm")}</span>
              </div>
            </div>

            {/* Content Area */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Subject</label>
                {editing ? (
                  <Input 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)} 
                    placeholder="No subject"
                  />
                ) : (
                  <div className="text-sm p-3 bg-muted/20 border rounded-md">
                    {data.subject || <span className="text-muted-foreground italic">No subject</span>}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Message Body</label>
                {editing ? (
                  <Textarea 
                    value={body} 
                    onChange={(e) => setBody(e.target.value)} 
                    className="min-h-[200px]"
                  />
                ) : (
                  <div className="text-sm p-3 bg-muted/20 border rounded-md min-h-[100px] whitespace-pre-wrap">
                    {data.body || <span className="text-muted-foreground italic">No message body</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Actions */}
            {editing && (
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => {
                  setEditing(false);
                  setSubject(data.subject || "");
                  setBody(data.body || "");
                }}>
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  <Check className="h-4 w-4 mr-2" /> {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">Communication not found.</div>
        )}
      </SheetContent>
    </Sheet>
  );
}
