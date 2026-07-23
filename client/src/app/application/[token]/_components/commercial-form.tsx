"use client";
import { toast } from "sonner";

import { useState } from "react";
import { Loader2, Plus, X } from "@/components/icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import type { ApplicationDirector, PublicApplicationInfo } from "@/hooks/useApplications";

interface FormState {
  // Applicant / Business
  businessName: string;
  businessBoxNumber: string;
  physicalAddress: string;
  telephone: string;
  faxNumber: string;
  email: string;
  // Directors
  directors: ApplicationDirector[];
  // Business
  dateIncorporated: string;
  operatingFromLastPremisesFor: string;
  intendedUse: string;
  numberOfEmployees: string;
  presentEstateAgent: string;
  reasonForVacating: string;
  // Credit references
  reference1Name: string;
  reference1Phone: string;
  reference2Name: string;
  reference2Phone: string;
  // Bankers
  bankersName: string;
  bankersBranch: string;
  bankersAccountNumber: string;
  // Consent
  agreeToTerms: boolean;
}

const EMPTY: FormState = {
  businessName: "", businessBoxNumber: "", physicalAddress: "",
  telephone: "", faxNumber: "", email: "",
  directors: [{ name: "", residentialAddress: "", idNumber: "", telephone: "" }],
  dateIncorporated: "", operatingFromLastPremisesFor: "", intendedUse: "", numberOfEmployees: "",
  presentEstateAgent: "", reasonForVacating: "",
  reference1Name: "", reference1Phone: "", reference2Name: "", reference2Phone: "",
  bankersName: "", bankersBranch: "", bankersAccountNumber: "",
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

interface Props {
  token: string;
  unitInfo: PublicApplicationInfo;
  onSubmitted: () => void;
}

export function CommercialApplicationForm({ token, unitInfo, onSubmitted }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const updateDirector = (index: number, patch: Partial<ApplicationDirector>) =>
    setForm((p) => ({ ...p, directors: p.directors.map((d, i) => (i === index ? { ...d, ...patch } : d)) }));

  const addDirector = () =>
    setForm((p) => ({ ...p, directors: [...p.directors, { name: "", residentialAddress: "", idNumber: "", telephone: "" }] }));

  const removeDirector = (index: number) =>
    setForm((p) => ({ ...p, directors: p.directors.filter((_, i) => i !== index) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim()) { setSubmitError("Applicant / business name is required."); return; }
    if (!form.agreeToTerms) { setSubmitError("You must agree to the terms and conditions."); return; }

    setSubmitting(true);
    setSubmitError("");

    const payload = {
      applicantName: form.businessName.trim(),
      applicantEmail: form.email || undefined,
      applicantPhone: form.telephone || undefined,
      businessName: form.businessName || undefined,
      businessBoxNumber: form.businessBoxNumber || undefined,
      physicalAddress: form.physicalAddress || undefined,
      faxNumber: form.faxNumber || undefined,
      dateIncorporated: form.dateIncorporated || undefined,
      operatingFromLastPremisesFor: form.operatingFromLastPremisesFor || undefined,
      intendedUse: form.intendedUse || undefined,
      numberOfEmployees: form.numberOfEmployees ? parseInt(form.numberOfEmployees, 10) : undefined,
      previousLandlord: form.presentEstateAgent || undefined,
      reasonForLeaving: form.reasonForVacating || undefined,
      reference1Name: form.reference1Name || undefined,
      reference1Phone: form.reference1Phone || undefined,
      reference2Name: form.reference2Name || undefined,
      reference2Phone: form.reference2Phone || undefined,
      bankersName: form.bankersName || undefined,
      bankersBranch: form.bankersBranch || undefined,
      bankersAccountNumber: form.bankersAccountNumber || undefined,
      directors: form.directors.filter((d) => d.name.trim()),
    };

    const res = await apiClient(`/applications/public/${token}`, { method: "POST", data: payload });
    if (res.success) { onSubmitted(); toast.success("Application submitted!", { description: "The property agent will contact you shortly." }); }
    else setSubmitError((res as any).error || "Submission failed. Please try again.");
    setSubmitting(false);
  };

  const { unit } = unitInfo;

  return (
    <>
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

        {/* Applicant / Business */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Applicant</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Applicant / Business Name" required>
              <Input value={form.businessName} onChange={set("businessName")} placeholder="Registered business name" />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Business Address / Box No.">
                <Input value={form.businessBoxNumber} onChange={set("businessBoxNumber")} placeholder="P.O. Box ..." />
              </Field>
              <Field label="Physical Address">
                <Input value={form.physicalAddress} onChange={set("physicalAddress")} />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Telephone" required>
                <PhoneInput value={form.telephone} onChange={(v) => setForm(p => ({ ...p, telephone: v }))} placeholder="+263 77 000 0000" required />
              </Field>
              <Field label="Fax No.">
                <Input value={form.faxNumber} onChange={set("faxNumber")} />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Directors */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Directors</CardTitle>
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addDirector}>
              <Plus className="h-3.5 w-3.5" /> Add Director
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.directors.map((d, i) => (
              <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-4 items-end border-b border-border pb-4 last:border-0 last:pb-0">
                <Field label={`Director ${i + 1} Full Name`}>
                  <Input value={d.name} onChange={(e) => updateDirector(i, { name: e.target.value })} />
                </Field>
                <Field label="Residential Address">
                  <Input value={d.residentialAddress ?? ""} onChange={(e) => updateDirector(i, { residentialAddress: e.target.value })} />
                </Field>
                <Field label="ID Number">
                  <Input value={d.idNumber ?? ""} onChange={(e) => updateDirector(i, { idNumber: e.target.value })} />
                </Field>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field label="Telephone">
                      <Input value={d.telephone ?? ""} onChange={(e) => updateDirector(i, { telephone: e.target.value })} />
                    </Field>
                  </div>
                  {form.directors.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeDirector(i)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Business Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Date Incorporated">
                <Input type="date" value={form.dateIncorporated} onChange={set("dateIncorporated")} />
              </Field>
              <Field label="For How Long Operating From Last Premises">
                <Input value={form.operatingFromLastPremisesFor} onChange={set("operatingFromLastPremisesFor")} placeholder="e.g. 3 years" />
              </Field>
            </div>
            <Field label="Intended Use of Premises">
              <Input value={form.intendedUse} onChange={set("intendedUse")} />
            </Field>
            <Field label="Number of Employees">
              <Input type="number" min="0" value={form.numberOfEmployees} onChange={set("numberOfEmployees")} />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Present Estate Agent / Lessor">
                <Input value={form.presentEstateAgent} onChange={set("presentEstateAgent")} />
              </Field>
            </div>
            <Field label="Reasons for Vacating">
              <Textarea rows={3} value={form.reasonForVacating} onChange={set("reasonForVacating")} />
            </Field>
          </CardContent>
        </Card>

        {/* Credit References */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Credit References</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Reference 1 - Name">
              <Input value={form.reference1Name} onChange={set("reference1Name")} />
            </Field>
            <Field label="Reference 1 - Phone">
              <Input value={form.reference1Phone} onChange={set("reference1Phone")} />
            </Field>
            <Field label="Reference 2 - Name">
              <Input value={form.reference2Name} onChange={set("reference2Name")} />
            </Field>
            <Field label="Reference 2 - Phone">
              <Input value={form.reference2Phone} onChange={set("reference2Phone")} />
            </Field>
          </CardContent>
        </Card>

        {/* Bankers */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Bankers</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Bank">
              <Input value={form.bankersName} onChange={set("bankersName")} />
            </Field>
            <Field label="Branch">
              <Input value={form.bankersBranch} onChange={set("bankersBranch")} />
            </Field>
            <Field label="A/C No.">
              <Input value={form.bankersAccountNumber} onChange={set("bankersAccountNumber")} />
            </Field>
          </CardContent>
        </Card>

        {/* Consent */}
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="py-5 space-y-4">
            <p className="text-sm leading-relaxed">
              I/We hereby agree to lease terms and conditions of the above property and further agree to pay 15% of the first rent
              and on lease renewal being the Lease fee. Should I/We decide to withdraw my application after approved by the owner,
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
    </>
  );
}
