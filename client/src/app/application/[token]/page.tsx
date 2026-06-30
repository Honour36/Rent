"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  DollarSign,
  User,
  Briefcase,
  Home,
  Users,
  FileText,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { apiClient } from "@/lib/api-client";
import type { PublicApplicationInfo } from "@/hooks/useApplications";

// ─── Steps Definition ──────────────────────────────────────────────────────────

const STEPS = [
  { id: "personal", label: "Personal", icon: User },
  { id: "employment", label: "Employment", icon: Briefcase },
  { id: "rental-history", label: "Rental History", icon: Home },
  { id: "references", label: "References", icon: Users },
  { id: "review", label: "Review", icon: FileText },
] as const;

type Step = (typeof STEPS)[number]["id"];

// ─── Form State ────────────────────────────────────────────────────────────────

interface FormState {
  // Personal
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  idNumber: string;
  dateOfBirth: string;
  // Employment
  employmentStatus: string;
  employer: string;
  jobTitle: string;
  monthlyIncome: string;
  // Rental History
  previousAddress: string;
  previousLandlord: string;
  previousLandlordPhone: string;
  previousRentAmount: string;
  reasonForLeaving: string;
  // References
  reference1Name: string;
  reference1Phone: string;
  reference1Relation: string;
  reference2Name: string;
  reference2Phone: string;
  reference2Relation: string;
  // Additional
  emergencyContactName: string;
  emergencyContactPhone: string;
  additionalNotes: string;
}

const EMPTY_FORM: FormState = {
  applicantName: "",
  applicantEmail: "",
  applicantPhone: "",
  idNumber: "",
  dateOfBirth: "",
  employmentStatus: "",
  employer: "",
  jobTitle: "",
  monthlyIncome: "",
  previousAddress: "",
  previousLandlord: "",
  previousLandlordPhone: "",
  previousRentAmount: "",
  reasonForLeaving: "",
  reference1Name: "",
  reference1Phone: "",
  reference1Relation: "",
  reference2Name: "",
  reference2Phone: "",
  reference2Relation: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  additionalNotes: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ApplicationFormPage() {
  const params = useParams();
  const token = params.token as string;

  const [unitInfo, setUnitInfo] = useState<PublicApplicationInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [infoError, setInfoError] = useState("");

  const [currentStep, setCurrentStep] = useState<Step>("personal");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ─ Load unit info ────────────────────────────────────────────────────────

  useEffect(() => {
    const loadInfo = async () => {
      setLoadingInfo(true);
      const res = await apiClient<PublicApplicationInfo>(
        `/applications/public/${token}`,
      );
      if (res.success) {
        setUnitInfo(res.data);
        if (res.data.alreadySubmitted) setSubmitted(true);
      } else {
        setInfoError(res.error);
      }
      setLoadingInfo(false);
    };
    if (token) loadInfo();
  }, [token]);

  // ─ Helpers ──────────────────────────────────────────────────────────────

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const goNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!form.applicantName.trim()) {
      setSubmitError("Your full name is required.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    const payload = {
      applicantName: form.applicantName,
      applicantEmail: form.applicantEmail || undefined,
      applicantPhone: form.applicantPhone || undefined,
      idNumber: form.idNumber || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      employmentStatus: form.employmentStatus || undefined,
      employer: form.employer || undefined,
      jobTitle: form.jobTitle || undefined,
      monthlyIncome: form.monthlyIncome ? parseFloat(form.monthlyIncome) : undefined,
      previousAddress: form.previousAddress || undefined,
      previousLandlord: form.previousLandlord || undefined,
      previousLandlordPhone: form.previousLandlordPhone || undefined,
      previousRentAmount: form.previousRentAmount ? parseFloat(form.previousRentAmount) : undefined,
      reasonForLeaving: form.reasonForLeaving || undefined,
      reference1Name: form.reference1Name || undefined,
      reference1Phone: form.reference1Phone || undefined,
      reference1Relation: form.reference1Relation || undefined,
      reference2Name: form.reference2Name || undefined,
      reference2Phone: form.reference2Phone || undefined,
      reference2Relation: form.reference2Relation || undefined,
      emergencyContactName: form.emergencyContactName || undefined,
      emergencyContactPhone: form.emergencyContactPhone || undefined,
      additionalNotes: form.additionalNotes || undefined,
    };

    const res = await apiClient(`/applications/public/${token}`, {
      method: "POST",
      data: payload,
    });

    if (res.success) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setSubmitError(res.error);
    }
    setSubmitting(false);
  };

  // ─ Loading / Error States ────────────────────────────────────────────────

  if (loadingInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading application...</p>
        </div>
      </div>
    );
  }

  if (infoError || !unitInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <p className="font-semibold text-foreground">Link not found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {infoError || "This application link is invalid or has expired."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { unit } = unitInfo;

  // ─ Success Screen ────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Application Submitted!</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Thank you. Your application for{" "}
                <span className="font-medium text-foreground">
                  Unit {unit.unit_number}
                </span>{" "}
                at{" "}
                <span className="font-medium text-foreground">{unit.property.name}</span>{" "}
                has been received. The agency will be in touch with you shortly.
              </p>
            </div>
            <div className="mt-2 rounded-lg border border-border bg-muted/40 p-4 text-left w-full">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Property Details</p>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <p className="text-sm text-foreground">
                  {unit.property.address}
                  {unit.property.city ? `, ${unit.property.city}` : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─ Main Form ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Property Header */}
      <div className="border-b border-border bg-card px-4 py-5">
        <div className="mx-auto max-w-lg">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Rental Application
              </p>
              <p className="font-semibold text-foreground">{unit.property.name}</p>
              {unit.property.address && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {unit.property.address}
                  {unit.property.city ? `, ${unit.property.city}` : ""}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">Unit {unit.unit_number}</Badge>
                {unit.bedrooms != null && (
                  <Badge variant="outline">{unit.bedrooms} Bed</Badge>
                )}
                {unit.bathrooms != null && (
                  <Badge variant="outline">{unit.bathrooms} Bath</Badge>
                )}
                <Badge variant="secondary">
                  <DollarSign className="mr-0.5 h-3 w-3" />
                  {Number(unit.rent_amount).toLocaleString()} {unit.currency}/mo
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Progress */}
      <div className="border-b border-border bg-card/50 px-4 py-3">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-1">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex flex-1 items-center">
                <button
                  onClick={() => idx <= currentStepIndex && setCurrentStep(step.id)}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors
                    ${idx < currentStepIndex
                      ? "bg-primary text-primary-foreground cursor-pointer"
                      : idx === currentStepIndex
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                        : "bg-muted text-muted-foreground cursor-default"
                    }`}
                >
                  {idx < currentStepIndex ? "✓" : idx + 1}
                </button>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 flex-1 rounded-full transition-colors ${idx < currentStepIndex ? "bg-primary" : "bg-muted"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Step {currentStepIndex + 1} of {STEPS.length} —{" "}
            <span className="font-medium text-foreground">
              {STEPS[currentStepIndex].label}
            </span>
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="mx-auto max-w-lg px-4 pt-6">
        {currentStep === "personal" && (
          <PersonalStep form={form} setField={setField} />
        )}
        {currentStep === "employment" && (
          <EmploymentStep form={form} setField={setField} />
        )}
        {currentStep === "rental-history" && (
          <RentalHistoryStep form={form} setField={setField} />
        )}
        {currentStep === "references" && (
          <ReferencesStep form={form} setField={setField} />
        )}
        {currentStep === "review" && (
          <ReviewStep form={form} unit={unit} />
        )}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          {currentStepIndex > 0 && (
            <Button variant="outline" className="flex-1" onClick={goPrev}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          )}
          {currentStep !== "review" ? (
            <Button className="flex-1" onClick={goNext}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <div className="flex flex-1 flex-col gap-2">
              {submitError && (
                <p className="text-xs text-destructive">{submitError}</p>
              )}
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step: Personal Details ────────────────────────────────────────────────────

function PersonalStep({
  form,
  setField,
}: {
  form: FormState;
  setField: (k: keyof FormState, v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Personal Details</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about yourself. Fields marked * are required.
        </p>
      </div>

      <FormField label="Full Name *" id="applicantName">
        <Input
          id="applicantName"
          placeholder="e.g. Tendai Moyo"
          value={form.applicantName}
          onChange={(e) => setField("applicantName", e.target.value)}
        />
      </FormField>

      <FormField label="Phone Number" id="applicantPhone">
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="applicantPhone"
            placeholder="+263 77 123 4567"
            className="pl-9"
            value={form.applicantPhone}
            onChange={(e) => setField("applicantPhone", e.target.value)}
          />
        </div>
      </FormField>

      <FormField label="Email Address" id="applicantEmail">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="applicantEmail"
            type="email"
            placeholder="name@example.com"
            className="pl-9"
            value={form.applicantEmail}
            onChange={(e) => setField("applicantEmail", e.target.value)}
          />
        </div>
      </FormField>

      <FormField label="National ID Number" id="idNumber">
        <Input
          id="idNumber"
          placeholder="e.g. 63-123456A78"
          value={form.idNumber}
          onChange={(e) => setField("idNumber", e.target.value)}
        />
      </FormField>

      <FormField label="Date of Birth" id="dateOfBirth">
        <Input
          id="dateOfBirth"
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => setField("dateOfBirth", e.target.value)}
        />
      </FormField>

      <FormField label="Emergency Contact Name" id="emergencyContactName">
        <Input
          id="emergencyContactName"
          placeholder="Next of kin or emergency contact"
          value={form.emergencyContactName}
          onChange={(e) => setField("emergencyContactName", e.target.value)}
        />
      </FormField>

      <FormField label="Emergency Contact Phone" id="emergencyContactPhone">
        <Input
          id="emergencyContactPhone"
          placeholder="+263 77 123 4567"
          value={form.emergencyContactPhone}
          onChange={(e) => setField("emergencyContactPhone", e.target.value)}
        />
      </FormField>
    </div>
  );
}

// ─── Step: Employment ─────────────────────────────────────────────────────────

function EmploymentStep({
  form,
  setField,
}: {
  form: FormState;
  setField: (k: keyof FormState, v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Employment</h2>
        <p className="text-sm text-muted-foreground">
          Your current employment situation.
        </p>
      </div>

      <FormField label="Employment Status" id="employmentStatus">
        <Select
          value={form.employmentStatus}
          onValueChange={(v) => setField("employmentStatus", v)}
        >
          <SelectTrigger id="employmentStatus">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employed_full_time">Employed — Full Time</SelectItem>
            <SelectItem value="employed_part_time">Employed — Part Time</SelectItem>
            <SelectItem value="self_employed">Self Employed</SelectItem>
            <SelectItem value="contract">Contract / Freelance</SelectItem>
            <SelectItem value="unemployed">Unemployed</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
            <SelectItem value="student">Student</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Employer / Business Name" id="employer">
        <Input
          id="employer"
          placeholder="e.g. First Mutual Insurance"
          value={form.employer}
          onChange={(e) => setField("employer", e.target.value)}
        />
      </FormField>

      <FormField label="Job Title / Position" id="jobTitle">
        <Input
          id="jobTitle"
          placeholder="e.g. Accounts Manager"
          value={form.jobTitle}
          onChange={(e) => setField("jobTitle", e.target.value)}
        />
      </FormField>

      <FormField label="Monthly Income (USD equivalent)" id="monthlyIncome">
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="monthlyIncome"
            type="number"
            min="0"
            placeholder="0.00"
            className="pl-9"
            value={form.monthlyIncome}
            onChange={(e) => setField("monthlyIncome", e.target.value)}
          />
        </div>
      </FormField>
    </div>
  );
}

// ─── Step: Rental History ─────────────────────────────────────────────────────

function RentalHistoryStep({
  form,
  setField,
}: {
  form: FormState;
  setField: (k: keyof FormState, v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Rental History</h2>
        <p className="text-sm text-muted-foreground">
          Your most recent rental. Leave blank if this is your first rental.
        </p>
      </div>

      <FormField label="Previous Address" id="previousAddress">
        <Textarea
          id="previousAddress"
          placeholder="Street, Suburb, City"
          rows={2}
          value={form.previousAddress}
          onChange={(e) => setField("previousAddress", e.target.value)}
        />
      </FormField>

      <FormField label="Previous Landlord / Agency Name" id="previousLandlord">
        <Input
          id="previousLandlord"
          placeholder="e.g. Pam Golding Properties"
          value={form.previousLandlord}
          onChange={(e) => setField("previousLandlord", e.target.value)}
        />
      </FormField>

      <FormField label="Previous Landlord Phone" id="previousLandlordPhone">
        <Input
          id="previousLandlordPhone"
          placeholder="+263 77 123 4567"
          value={form.previousLandlordPhone}
          onChange={(e) => setField("previousLandlordPhone", e.target.value)}
        />
      </FormField>

      <FormField label="Previous Monthly Rent (USD)" id="previousRentAmount">
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="previousRentAmount"
            type="number"
            min="0"
            placeholder="0.00"
            className="pl-9"
            value={form.previousRentAmount}
            onChange={(e) => setField("previousRentAmount", e.target.value)}
          />
        </div>
      </FormField>

      <FormField label="Reason for Leaving" id="reasonForLeaving">
        <Textarea
          id="reasonForLeaving"
          placeholder="e.g. Relocating for work, end of lease, etc."
          rows={2}
          value={form.reasonForLeaving}
          onChange={(e) => setField("reasonForLeaving", e.target.value)}
        />
      </FormField>
    </div>
  );
}

// ─── Step: References ─────────────────────────────────────────────────────────

function ReferencesStep({
  form,
  setField,
}: {
  form: FormState;
  setField: (k: keyof FormState, v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">References</h2>
        <p className="text-sm text-muted-foreground">
          Provide up to two personal or professional references.
        </p>
      </div>

      {/* Reference 1 */}
      <div className="rounded-lg border border-border p-4 flex flex-col gap-4">
        <p className="text-sm font-medium text-foreground">Reference 1</p>
        <FormField label="Full Name" id="reference1Name">
          <Input
            id="reference1Name"
            placeholder="e.g. Grace Mutasa"
            value={form.reference1Name}
            onChange={(e) => setField("reference1Name", e.target.value)}
          />
        </FormField>
        <FormField label="Phone" id="reference1Phone">
          <Input
            id="reference1Phone"
            placeholder="+263 77 123 4567"
            value={form.reference1Phone}
            onChange={(e) => setField("reference1Phone", e.target.value)}
          />
        </FormField>
        <FormField label="Relationship" id="reference1Relation">
          <Input
            id="reference1Relation"
            placeholder="e.g. Employer, Friend, Colleague"
            value={form.reference1Relation}
            onChange={(e) => setField("reference1Relation", e.target.value)}
          />
        </FormField>
      </div>

      {/* Reference 2 */}
      <div className="rounded-lg border border-border p-4 flex flex-col gap-4">
        <p className="text-sm font-medium text-foreground">Reference 2 (optional)</p>
        <FormField label="Full Name" id="reference2Name">
          <Input
            id="reference2Name"
            placeholder="e.g. Joseph Banda"
            value={form.reference2Name}
            onChange={(e) => setField("reference2Name", e.target.value)}
          />
        </FormField>
        <FormField label="Phone" id="reference2Phone">
          <Input
            id="reference2Phone"
            placeholder="+263 77 123 4567"
            value={form.reference2Phone}
            onChange={(e) => setField("reference2Phone", e.target.value)}
          />
        </FormField>
        <FormField label="Relationship" id="reference2Relation">
          <Input
            id="reference2Relation"
            placeholder="e.g. Employer, Friend, Colleague"
            value={form.reference2Relation}
            onChange={(e) => setField("reference2Relation", e.target.value)}
          />
        </FormField>
      </div>

      {/* Additional Notes */}
      <FormField label="Additional Notes" id="additionalNotes">
        <Textarea
          id="additionalNotes"
          placeholder="Anything else you'd like the agent to know..."
          rows={3}
          value={form.additionalNotes}
          onChange={(e) => setField("additionalNotes", e.target.value)}
        />
      </FormField>
    </div>
  );
}

// ─── Step: Review ─────────────────────────────────────────────────────────────

function ReviewStep({
  form,
  unit,
}: {
  form: FormState;
  unit: PublicApplicationInfo["unit"];
}) {
  const formatCurrency = (val: string, curr: string) => {
    if (!val) return "—";
    return `${parseFloat(val).toLocaleString()} ${curr}`;
  };

  const rows: [string, string][] = [
    ["Full Name", form.applicantName || "—"],
    ["Phone", form.applicantPhone || "—"],
    ["Email", form.applicantEmail || "—"],
    ["National ID", form.idNumber || "—"],
    ["Date of Birth", form.dateOfBirth || "—"],
    ["Emergency Contact", form.emergencyContactName || "—"],
    ["Emergency Phone", form.emergencyContactPhone || "—"],
    ["Employment Status", form.employmentStatus || "—"],
    ["Employer", form.employer || "—"],
    ["Job Title", form.jobTitle || "—"],
    ["Monthly Income", formatCurrency(form.monthlyIncome, "USD")],
    ["Previous Address", form.previousAddress || "—"],
    ["Previous Landlord", form.previousLandlord || "—"],
    ["Previous Landlord Phone", form.previousLandlordPhone || "—"],
    ["Reason for Leaving", form.reasonForLeaving || "—"],
    ["Reference 1", form.reference1Name ? `${form.reference1Name} (${form.reference1Relation || "—"}) — ${form.reference1Phone || "—"}` : "—"],
    ["Reference 2", form.reference2Name ? `${form.reference2Name} (${form.reference2Relation || "—"}) — ${form.reference2Phone || "—"}` : "—"],
    ["Additional Notes", form.additionalNotes || "—"],
  ];

  return (
    <div className="flex flex-col gap-5 pb-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Review & Submit</h2>
        <p className="text-sm text-muted-foreground">
          Please review your details before submitting. You cannot edit after submission.
        </p>
      </div>

      {/* Property summary */}
      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
          Applying for
        </p>
        <p className="font-medium text-foreground">
          {unit.property.name} — Unit {unit.unit_number}
        </p>
        <p className="text-sm text-muted-foreground">
          {Number(unit.rent_amount).toLocaleString()} {unit.currency}/month
        </p>
      </div>

      {/* Data review */}
      <div className="rounded-lg border border-border overflow-hidden">
        {rows.map(([label, value], i) => (
          <div
            key={label}
            className={`flex gap-3 px-4 py-3 ${i % 2 === 0 ? "bg-card" : "bg-muted/30"}`}
          >
            <span className="min-w-[140px] shrink-0 text-xs font-medium text-muted-foreground">
              {label}
            </span>
            <span className="text-sm text-foreground break-words">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared FormField ─────────────────────────────────────────────────────────

function FormField({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
