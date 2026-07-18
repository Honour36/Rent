"use client";
import { toast } from "sonner";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Building2, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";

interface RentCollectionInfo {
  expired: boolean;
  scheduledFor?: string | null;
  ownerName?: string;
  tenantName?: string;
  propertyName?: string;
  propertyAddress?: string;
  unitNumber?: string;
  amount?: number;
  currency?: string;
  receiptNumber?: string | null;
  paymentDate?: string;
}

export default function RentCollectionPage() {
  const params = useParams();
  const token = params.token as string;

  const [info, setInfo] = useState<RentCollectionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!token) return;
    apiClient<RentCollectionInfo>(`/rent-collection/public/${token}`)
      .then((res) => {
        if (res.success) setInfo((res as any).data);
        else setLoadError((res as any).error || "This link is invalid or has expired.");
      })
      .catch(() => setLoadError("Network error loading this link."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      toast.warning("Please choose a date and time.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    const scheduledFor = new Date(`${date}T${time}`).toISOString();
    const res = await apiClient(`/rent-collection/public/${token}`, {
      method: "POST",
      data: { scheduledFor, notes: notes || undefined },
    });
    if (res.success) {
      setSubmitted(true);
      toast.success("Thank you - your agent has been notified.");
    } else {
      setSubmitError((res as any).error || "Could not save your preferred time. Please try again.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadError || !info) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-2">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <p className="font-medium">{loadError || "This link is invalid or has expired."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (info.expired || submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
            <p className="font-medium">
              {submitted ? "Your collection time has been set." : "This link has already been used."}
            </p>
            {(submitted ? new Date(`${date}T${time}`) : info.scheduledFor ? new Date(info.scheduledFor) : null) && (
              <p className="text-sm text-muted-foreground">
                {(submitted ? new Date(`${date}T${time}`) : new Date(info.scheduledFor!)).toLocaleString("en-GB", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            )}
            <p className="text-sm text-muted-foreground">Your agent has been notified and this link is no longer active.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Building2 className="h-8 w-8 mx-auto text-primary" />
          <h1 className="text-xl font-bold">When would you like to collect the rent?</h1>
          <p className="text-sm text-muted-foreground">Dear {info.ownerName}, a rent payment has been recorded for your property.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p><span className="text-muted-foreground">Property:</span> {info.propertyName} - {info.unitNumber}</p>
            <p><span className="text-muted-foreground">Tenant:</span> {info.tenantName}</p>
            <p><span className="text-muted-foreground">Amount:</span> {info.currency} {info.amount?.toLocaleString()}</p>
            {info.receiptNumber && <p><span className="text-muted-foreground">Receipt:</span> {info.receiptNumber}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Choose a Date &amp; Time</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                    min={new Date().toISOString().split("T")[0]} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Note for your agent (optional)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. I'll send someone on my behalf" rows={3} />
              </div>
              {submitError && <p className="text-sm text-destructive">{submitError}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Saving…" : "Confirm Collection Time"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">This link can only be used once.</p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
