"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Loader2, AlertCircle } from "@/components/icons";
import { Logo } from "@/components/logo";

import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import type { PublicApplicationInfo } from "@/hooks/useApplications";
import { ResidentialApplicationForm } from "./_components/residential-form";
import { CommercialApplicationForm } from "./_components/commercial-form";

export default function ApplicationPage() {
  const params = useParams();
  const token = params.token as string;

  const [unitInfo, setUnitInfo] = useState<PublicApplicationInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [infoError, setInfoError] = useState("");
  const [submitted, setSubmitted] = useState(false);

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

  if ((unitInfo as any).expired) return (
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

  const isCommercial = unitInfo.unit.property.type === "commercial";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <Logo height={24} />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            {isCommercial ? "Commercial / Business Premises Application Form" : "Tenancy Application Form"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            This property is leased in its present condition unless the owner agrees in writing to carry out the necessary repairs.
          </p>
        </div>

        {isCommercial ? (
          <CommercialApplicationForm token={token} unitInfo={unitInfo} onSubmitted={() => { setSubmitted(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        ) : (
          <ResidentialApplicationForm token={token} unitInfo={unitInfo} onSubmitted={() => { setSubmitted(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        )}
      </div>
    </div>
  );
}
