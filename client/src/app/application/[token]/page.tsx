"use client";
import { toast } from "sonner";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Loader2, Upload, X, AlertCircle } from "@/components/icons";
import { Logo } from "@/components/logo";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import type { PublicApplicationInfo } from "@/hooks/useApplications";

interface FormState {
  // Section 1 - Tenant
  title: string;
  fullName: string;
  idNumber: string;
  dateOfBirth: string;
  cellNo: string;
  workNo: string;
  email: string;
  // Section 2 - Employment
  employer: string;
  occupation: string;
  yearsEmployed: string;
  salary: string;
  employerAddress: string;
  // Section 3 - Spouse / Dependants
  spouseName: string;
  numberOfDependants: string;
  spouseEmployer: string;
  spouseYearsEmployed: string;
  spouseSalary: string;
  spouseEmployerAddress: string;
  spouseWorkNo: string;
  spouseCellNo: string;
  // Section 4 - Guarantor
  guarantorName: string;
  guarantorContact: string;
  // Section 5 - Addresses
  presentAddress: string;
  previousAddress: string;
  presentEstateOwner: string;
  presentEstateOwnerCell: string;
  reasonForVacating: string;
  // Section 6 - Trade Reference
  reference1Name: string;
  reference1AccountTel: string;
  // Consent
  agreeToTerms: boolean;
}

const EMPTY: FormState = {
  title: "MR",
  fullName: "", idNumber: "", dateOfBirth: "",
  cellNo: "", workNo: "", email: "",
  employer: "", occupation: "", yearsEmployed: "", salary: "", employerAddress: "",
  spouseName: "", numberOfDependants: "",
  spouseEmployer: "", spouseYearsEmployed: "", spouseSalary: "",
  spouseEmployerAddress: "", spouseWorkNo: "", spouseCellNo: "",
  guarantorName: "", guarantorContact: "",
  presentAddress: "", previousAddress: "",
  presentEstateOwner: "", presentEstateOwnerCell: "", reasonForVacating: "",
  reference1Name: "", reference1AccountTel: "",
  agreeToTerms: false,
};

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

export default function ApplicationPage() {
  const params = useParams();
  const token = params.token as string;

  const [unitInfo, setUnitInfo] = useState<PublicApplicationInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [infoError, setInfoError] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    setLoadingInfo(true);
    apiClient<PublicApplicationInfo>(`/applications/public/${token}`)
      .then((res) => {
        if (res.success) setUnitInfo((res as any).data);
        else setInfoError((res as any).error || "Invalid or expired link");
      })
      .catch(() => setInfoError("Network error loading application."))
      .finally(() => setLoadingInfo(false));
  }, [token]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: (e.target as HTMLInputElement).type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) { setSubmitError("Full name is required."); return; }
    if (!form.agreeToTerms) { setSubmitError("You must agree to the terms and conditions."); return; }

    setSubmitting(true);
    setSubmitError("");

    // Upload ID document first if provided. This goes through a dedicated
    // public, token-scoped endpoint - /storage/upload requires a logged-in
    // session, which applicants filling out this public form never have, so
    // that upload was silently failing 100% of the time before this fix.
    let idDocumentUrl: string | undefined;
    if (idFile) {
      const formData = new FormData();
      formData.append("file", idFile);
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/applications/public/${token}/id-document`, {
        method: "POST",
        body: formData,
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        idDocumentUrl = uploadData.data?.path;
      } else {
        toast.warning("Your ID document couldn't be uploaded, but the rest of your application will still be submitted.");
      }
    }

    const payload = {
      applicantName: `${form.title} ${form.fullName}`.trim(),
      applicantEmail: form.email || undefined,
      applicantPhone: form.cellNo || undefined,
      idNumber: form.idNumber || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      employer: form.employer || undefined,
      jobTitle: form.occupation || undefined,
      employmentStatus: form.employer ? "employed" : "unemployed",
      monthlyIncome: form.salary ? parseFloat(form.salary) : undefined,
      previousAddress: form.previousAddress || undefined,
      previousLandlord: form.presentEstateOwner || undefined,
      previousLandlordPhone: form.presentEstateOwnerCell || undefined,
      reasonForLeaving: form.reasonForVacating || undefined,
      reference1Name: form.reference1Name || undefined,
      reference1Phone: form.reference1AccountTel || undefined,
      idDocumentUrl,
      additionalNotes: [
        form.spouseName ? `Spouse: ${form.spouseName}` : "",
        form.numberOfDependants ? `Dependants: ${form.numberOfDependants}` : "",
        form.guarantorName ? `Guarantor: ${form.guarantorName} (${form.guarantorContact})` : "",
        form.workNo ? `Work No: ${form.workNo}` : "",
        form.yearsEmployed ? `Years employed: ${form.yearsEmployed}` : "",
      ].filter(Boolean).join(" | ") || undefined,
    };

    const res = await apiClient(`/applications/public/${token}`, { method: "POST", data: payload });
    if (res.success) { setSubmitted(true); window.scrollTo({ top: 0, behavior: "smooth" }); toast.success("Application submitted!", { description: "The property agent will contact you shortly." }); }
    else setSubmitError((res as any).error || "Submission failed. Please try again.");
    setSubmitting(false);
  };

  if (loadingInfo) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (infoError || !unitInfo) return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="font-semibold">Link not found</p>
          <p className="text-sm text-muted-foreground">{infoError || "This application link is invalid or has expired."}</p>
        </CardContent>
      </Card>
    </div>
  );

  if (unitInfo && (unitInfo as any).expired) return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg text-center">
        <CardContent className="flex flex-col items-center gap-4 py-16">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Link Expired</h2>
          <p className="text-muted-foreground">This application link has already been used and is no longer active. If you believe this is an error, please contact the property agent directly.</p>
        </CardContent>
      </Card>
    </div>
  );

  if (submitted) return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg text-center">
        <CardContent className="flex flex-col items-center gap-4 py-16">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-bold">Application Submitted!</h2>
          <p className="text-muted-foreground">Your application for <strong>{unitInfo.unit.property.name} - Unit {unitInfo.unit.unit_number}</strong> has been received. The agent will be in touch shortly.</p>
          <p className="text-xs text-muted-foreground">NB: A non-refundable fee of USD 10.00 is paid for credit clearance.</p>
        </CardContent>
      </Card>
    </div>
  );

  const { unit } = unitInfo;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <Logo height={24} />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wide">Tenancy Application Form</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            This property is leased in its present condition unless the owner agrees in writing to carry out the necessary repairs.
          </p>
        </div>

        {/* Property info */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div><span className="text-muted-foreground">Property: </span><strong>{unit.property.name}</strong></div>
              <div><span className="text-muted-foreground">Unit: </span><strong>{unit.unit_number}</strong></div>
              <div><span className="text-muted-foreground">Rent: </span><strong>{unit.currency} {unit.rent_amount?.toLocaleString()}/mo</strong></div>
              <Badge variant={unit.status === "vacant" ? "outline" : "secondary"} className="capitalize">{unit.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              RENT: {unit.currency} {unit.rent_amount?.toLocaleString()} &nbsp;|&nbsp; DEPOSIT: {unit.currency} {(Number(unit.rent_amount) * 2).toLocaleString()} &nbsp;|&nbsp; LEASE PERIOD: 12 calendar months notice
            </p>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1 - Personal */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Title">
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    value={form.title} onChange={set("title")}>
                    <option>MR</option><option>MRS</option><option>MS</option><option>DR</option>
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Full Name of Tenant" required>
                    <Input value={form.fullName} onChange={set("fullName")} placeholder="As on national ID" />
                  </Field>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="ID / Passport Number" required>
                  <Input value={form.idNumber} onChange={set("idNumber")} placeholder="63-123456A00" />
                </Field>
                <Field label="Date of Birth">
                  <Input type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Cell No." required>
                  <PhoneInput value={form.cellNo} onChange={(v) => setForm(p => ({...p, cellNo: v}))} placeholder="+263 77 000 0000" required />
                </Field>
                <Field label="Work No.">
                  <PhoneInput value={form.workNo} onChange={(v) => setForm(p => ({...p, workNo: v}))} placeholder="+263 24 000 0000" />
                </Field>
                <Field label="Email">
                  <Input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
                </Field>
              </div>

              {/* ID Upload */}
              <Field label="Upload ID / Passport copy">
                <div className="flex items-center gap-3">
                  <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
                    onChange={(e) => setIdFile(e.target.files?.[0] ?? null)} />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Choose File
                  </Button>
                  {idFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="truncate max-w-[200px]">{idFile.name}</span>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIdFile(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Accepted: PDF, JPG, PNG (max 5MB)</p>
              </Field>
            </CardContent>
          </Card>

          {/* Section 2 - Employment */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Employment Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Employer">
                  <Input value={form.employer} onChange={set("employer")} placeholder="Company / Organisation" />
                </Field>
                <Field label="Occupation">
                  <Input value={form.occupation} onChange={set("occupation")} placeholder="Job Title" />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Years Employed">
                  <Input type="number" min="0" value={form.yearsEmployed} onChange={set("yearsEmployed")} placeholder="e.g. 3" />
                </Field>
                <Field label="Monthly Salary (USD)">
                  <Input type="number" min="0" value={form.salary} onChange={set("salary")} placeholder="e.g. 800" />
                </Field>
              </div>
              <Field label="Employer's Address">
                <Input value={form.employerAddress} onChange={set("employerAddress")} placeholder="Full work address" />
              </Field>
            </CardContent>
          </Card>

          {/* Section 3 - Spouse */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Spouse & Dependants</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Spouse's Name">
                  <Input value={form.spouseName} onChange={set("spouseName")} placeholder="If applicable" />
                </Field>
                <Field label="No. of Dependants & Ages">
                  <Input value={form.numberOfDependants} onChange={set("numberOfDependants")} placeholder="e.g. 2 (ages 5, 10)" />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Spouse's Employer">
                  <Input value={form.spouseEmployer} onChange={set("spouseEmployer")} />
                </Field>
                <Field label="Years Employed">
                  <Input value={form.spouseYearsEmployed} onChange={set("spouseYearsEmployed")} />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Spouse Salary (USD)">
                  <Input type="number" value={form.spouseSalary} onChange={set("spouseSalary")} />
                </Field>
                <Field label="Spouse Work No.">
                  <PhoneInput value={form.spouseWorkNo} onChange={(v) => setForm(p => ({...p, spouseWorkNo: v}))} />
                </Field>
                <Field label="Spouse Cell No.">
                  <PhoneInput value={form.spouseCellNo} onChange={(v) => setForm(p => ({...p, spouseCellNo: v}))} />
                </Field>
              </div>
              <Field label="Spouse Employer's Address">
                <Input value={form.spouseEmployerAddress} onChange={set("spouseEmployerAddress")} />
              </Field>
            </CardContent>
          </Card>

          {/* Section 4 - Guarantor */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Guarantor</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Guarantor's Full Name">
                <Input value={form.guarantorName} onChange={set("guarantorName")} />
              </Field>
              <Field label="Guarantor's Contact No.">
                <Input value={form.guarantorContact} onChange={set("guarantorContact")} />
              </Field>
            </CardContent>
          </Card>

          {/* Section 5 - Addresses */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Residential History</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Present Residential Address">
                <Input value={form.presentAddress} onChange={set("presentAddress")} placeholder="Current home address" />
              </Field>
              <Field label="Previous Address (if less than 2 years at present)">
                <Input value={form.previousAddress} onChange={set("previousAddress")} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Present Estate / Owner">
                  <Input value={form.presentEstateOwner} onChange={set("presentEstateOwner")} />
                </Field>
                <Field label="Owner's Cell No.">
                  <PhoneInput value={form.presentEstateOwnerCell} onChange={(v) => setForm(p => ({...p, presentEstateOwnerCell: v}))} />
                </Field>
              </div>
              <Field label="Reasons for Vacating Present Accommodation">
                <Textarea rows={3} value={form.reasonForVacating} onChange={set("reasonForVacating")} />
              </Field>
            </CardContent>
          </Card>

          {/* Section 6 - Trade Reference */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Trade Reference</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Reference Name">
                <Input value={form.reference1Name} onChange={set("reference1Name")} placeholder="Bank / Business name" />
              </Field>
              <Field label="A/C No. / Tel">
                <Input value={form.reference1AccountTel} onChange={set("reference1AccountTel")} placeholder="Account or phone" />
              </Field>
            </CardContent>
          </Card>

          {/* Consent */}
          <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
            <CardContent className="py-5 space-y-4">
              <p className="text-sm leading-relaxed">
                I understand & agree (i) this is an application to rent only and does not guarantee that I will be offered the
                property and (ii) the Landlord or Agent may accept more than one application and will select the best qualified applicant.
                I hereby authorise the Landlord or Agent to verify the information provided.
              </p>
              <p className="text-sm leading-relaxed">
                I/We hereby agree to lease terms and conditions of the above property and further agree to pay 15% of the first rent
                and on lease renewal to the Agent being Lease fee. Should I/We decide to withdraw my application after approval by the owner,
                I/We shall be responsible to pay USD 50.00 for wasted costs.
              </p>
              <p className="text-sm font-medium">
                NB: A non-refundable fee of USD 10.00 is paid for the credit clearance.
              </p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-primary"
                  checked={form.agreeToTerms}
                  onChange={(e) => setForm((p) => ({ ...p, agreeToTerms: e.target.checked }))}
                />
                <span className="text-sm font-medium">
                  I agree to the lease terms and conditions above and consent to verification of the information I have provided.
                  <span className="text-destructive ml-1">*</span>
                </span>
              </label>
            </CardContent>
          </Card>

          {submitError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitting ? "Submitting Application…" : "Submit Application"}
          </Button>

          <p className="text-center text-xs text-muted-foreground pb-8">
            By submitting you agree to the terms above. Your information is handled securely.
          </p>
        </form>
      </div>
    </div>
  );
}
