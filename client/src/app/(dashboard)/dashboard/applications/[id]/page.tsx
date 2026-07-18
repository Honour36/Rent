'use client';
import React from "react";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  Loader2,
  User,
  Briefcase,
  Home,
  Users,
  Phone,
  Mail,
  FileText,
  ExternalLink,
  Check,
  Copy,
  Download,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useApplication } from "@/hooks/useApplications";
import { apiClient } from "@/lib/api-client";
import { MoveInActivationCard } from "../_components/move-in-activation-card";

// ─── Status Config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Pending Review", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  more_info: { label: "More Info Requested", variant: "outline" },
};


function CopyIdButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
    >
      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { application, loading, error, refetch } = useApplication(id);

  const [vettingNotes, setVettingNotes] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [idDocUrl, setIdDocUrl] = useState<string | null>(null);
  const [idDocLoading, setIdDocLoading] = useState(false);

  useEffect(() => {
    if (!application?.id_document_url) return;
    setIdDocLoading(true);
    apiClient<{ url: string | null }>(`/applications/${id}/id-document`)
      .then((res) => { if (res.success) setIdDocUrl((res as any).data?.url ?? null); })
      .finally(() => setIdDocLoading(false));
  }, [application?.id_document_url, id]);

  const handleDownload = () => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    window.open(`${base}/applications/${id}/pdf`, "_blank");
  };

  const handleAction = async (status: "approved" | "rejected" | "more_info") => {
    setActionLoading(status);
    setActionError("");
    const res = await apiClient(`/applications/${id}/status`, {
      method: "PATCH",
      data: { status, vettingNotes: vettingNotes || undefined },
    });
    if (res.success) {
      await refetch();
      setVettingNotes("");
    } else {
      setActionError(res.error);
    }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !application) {
    return <p className="text-sm text-destructive">{error || "Application not found."}</p>;
  }

  const fd = application.form_data ?? {};
  const cfg = STATUS_CONFIG[application.status] ?? STATUS_CONFIG.pending;
  const hasContent = application.applicant_name && application.applicant_name.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {hasContent ? application.applicant_name : "Pending Submission"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Application for {application.unit.property.name} - Unit{" "}
            {application.unit.unit_number}
          </p>
        </div>
        <Badge variant={cfg.variant}>{cfg.label}</Badge>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload}>
          <Download className="h-3.5 w-3.5" />
          Download Application
        </Button>
      </div>
      {/* Application ID + National ID */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground -mt-2 ml-12">
        <div className="flex items-center gap-2">
          <span>Application ID:</span>
          <code className="bg-muted px-2 py-0.5 rounded text-xs">{id}</code>
          <CopyIdButton value={id} />
        </div>
        {hasContent && fd.idNumber && (
          <div className="flex items-center gap-2">
            <span>Applicant National ID:</span>
            <code className="bg-muted px-2 py-0.5 rounded text-xs font-semibold text-foreground">{fd.idNumber}</code>
            <CopyIdButton value={fd.idNumber} />
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left Column ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 lg:col-span-2">

          {/* Unit Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Property & Unit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <InfoRow label="Property" value={application.unit.property.name} />
                <InfoRow label="Unit" value={`Unit ${application.unit.unit_number}`} />
                <InfoRow
                  label="Rent"
                  value={`${Number(application.unit.rent_amount).toLocaleString()} ${application.unit.currency}/mo`}
                />
                <InfoRow
                  label="Submitted"
                  value={
                    hasContent
                      ? application.submitted_at ? new Date(application.submitted_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "Not submitted yet"
                      : "Not yet submitted"
                  }
                />
              </div>
            </CardContent>
          </Card>

          {hasContent ? (
            <>
              {/* Personal Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4" />
                    Personal Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoRow label="Full Name" value={application.applicant_name} />
                    <InfoRow label="National ID" value={fd.idNumber} />
                    <InfoRow label="Date of Birth" value={fd.dateOfBirth} />
                    <InfoRow
                      label="Phone"
                      value={application.applicant_phone}
                      icon={<Phone className="h-3.5 w-3.5" />}
                    />
                    <InfoRow
                      label="Email"
                      value={application.applicant_email}
                      icon={<Mail className="h-3.5 w-3.5" />}
                    />
                    <InfoRow label="Emergency Contact" value={fd.emergencyContactName} />
                    <InfoRow
                      label="Emergency Phone"
                      value={fd.emergencyContactPhone}
                      icon={<Phone className="h-3.5 w-3.5" />}
                    />
                  </div>

                  {/* Applicant's uploaded ID photo/document, for verification. */}
                  {application.id_document_url && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-2">ID Document</p>
                      {idDocLoading ? (
                        <p className="text-sm text-muted-foreground">Loading…</p>
                      ) : idDocUrl ? (
                        /\.pdf($|\?)/i.test(idDocUrl) ? (
                          <a href={idDocUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" /> View uploaded PDF
                          </a>
                        ) : (
                          <a href={idDocUrl} target="_blank" rel="noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={idDocUrl} alt="Applicant ID document" className="max-h-64 rounded-md border object-contain" />
                          </a>
                        )
                      ) : (
                        <p className="text-sm text-muted-foreground">Could not load the ID document.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Employment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Briefcase className="h-4 w-4" />
                    Employment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoRow label="Status" value={fd.employmentStatus?.replace(/_/g, " ")} />
                    <InfoRow label="Employer" value={fd.employer} />
                    <InfoRow label="Job Title" value={fd.jobTitle} />
                    <InfoRow
                      label="Monthly Income"
                      value={fd.monthlyIncome != null ? `USD ${Number(fd.monthlyIncome).toLocaleString()}` : undefined}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Rental History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Home className="h-4 w-4" />
                    Rental History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoRow label="Previous Address" value={fd.previousAddress} colSpan />
                    <InfoRow label="Previous Landlord" value={fd.previousLandlord} />
                    <InfoRow label="Landlord Phone" value={fd.previousLandlordPhone} />
                    <InfoRow
                      label="Previous Rent"
                      value={fd.previousRentAmount != null ? `USD ${Number(fd.previousRentAmount).toLocaleString()}` : undefined}
                    />
                    <InfoRow label="Reason for Leaving" value={fd.reasonForLeaving} colSpan />
                  </div>
                </CardContent>
              </Card>

              {/* References */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4" />
                    References
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div className="flex flex-col gap-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Reference 1
                      </p>
                      <InfoRow label="Name" value={fd.reference1Name} />
                      <InfoRow label="Phone" value={fd.reference1Phone} />
                      <InfoRow label="Relation" value={fd.reference1Relation} />
                    </div>
                    <div className="flex flex-col gap-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Reference 2
                      </p>
                      <InfoRow label="Name" value={fd.reference2Name} />
                      <InfoRow label="Phone" value={fd.reference2Phone} />
                      <InfoRow label="Relation" value={fd.reference2Relation} />
                    </div>
                  </div>
                  {fd.additionalNotes && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                          Additional Notes
                        </p>
                        <p className="text-sm text-foreground">{fd.additionalNotes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex h-40 flex-col items-center justify-center gap-2 text-center">
                <Clock className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Awaiting Submission</p>
                <p className="text-sm text-muted-foreground">
                  The applicant has not yet submitted this form.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 gap-1"
                  onClick={() => {
                    const url = `${window.location.origin}/application/${application.token}`;
                    navigator.clipboard.writeText(url);
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Copy Application Link
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right Column: Vetting Panel ────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          <Card className={application.status === 'approved' ? "" : "sticky top-6"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Vetting
              </CardTitle>
              <CardDescription>
                Add notes and set the application status.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Current status */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                  Current Status
                </p>
                <Badge variant={cfg.variant}>{cfg.label}</Badge>
                {application.reviewer && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Reviewed by {application.reviewer.full_name}
                  </p>
                )}
              </div>

              {application.vetting_notes && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                    Previous Notes
                  </p>
                  <p className="text-sm text-foreground rounded-md border border-border bg-muted/40 p-3">
                    {application.vetting_notes}
                  </p>
                </div>
              )}

              <Separator />

              {/* Notes field */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="vettingNotes">Notes</Label>
                <Textarea
                  id="vettingNotes"
                  placeholder="Add vetting notes, conditions, or reason for decision..."
                  rows={4}
                  value={vettingNotes}
                  onChange={(e) => setVettingNotes(e.target.value)}
                  disabled={application.status === 'approved'}
                />
              </div>

              {actionError && (
                <p className="text-sm text-destructive">{actionError}</p>
              )}

              {/* Action buttons */}
              {application.status !== 'approved' && (
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full gap-2"
                    onClick={() => handleAction("approved")}
                    disabled={!!actionLoading || !hasContent}
                  >
                    {actionLoading === "approved" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => handleAction("more_info")}
                    disabled={!!actionLoading || !hasContent}
                  >
                    {actionLoading === "more_info" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                    Request More Info
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    onClick={() => handleAction("rejected")}
                    disabled={!!actionLoading || !hasContent}
                  >
                    {actionLoading === "rejected" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    Reject
                  </Button>
                </div>
              )}
              {!hasContent && (
                <p className="text-xs text-muted-foreground text-center">
                  Actions are disabled until the applicant submits the form.
                </p>
              )}
            </CardContent>
          </Card>

          {application.status === 'approved' && (
            <div className="sticky top-6">
              <MoveInActivationCard
                unitId={application.unit.id}
                defaultRent={Number(application.unit.rent_amount)}
                onActivated={() => router.push('/dashboard/tenants')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shared Row ────────────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  icon,
  colSpan,
}: {
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
  colSpan?: boolean;
}) {
  return (
    <div className={colSpan ? "col-span-2" : ""}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm font-medium text-foreground flex items-center gap-1 ${!value ? "text-muted-foreground" : ""}`}>
        {icon}
        {value || "-"}
      </p>
    </div>
  );
}
