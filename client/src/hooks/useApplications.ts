import { useEffect, useState } from "react";

import { apiClient } from "@/lib/api-client";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ApplicationListItem {
  id: string;
  token: string;
  status: "pending" | "approved" | "rejected" | "more_info";
  applicant_name: string;
  applicant_email: string | null;
  applicant_phone: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  vetting_notes: string | null;
  unit: {
    id: string;
    unit_number: string;
    rent_amount: number;
    currency: string;
    property: { name: string; address: string | null; type?: string };
  };
  reviewer: { full_name: string | null } | null;
}

export interface ApplicationDetail extends ApplicationListItem {
  form_data: ApplicationFormData;
  id_document_url: string | null;
}

export interface ApplicationDirector {
  name: string;
  residentialAddress?: string;
  idNumber?: string;
  telephone?: string;
}

export interface ApplicationFormData {
  applicantName?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  idNumber?: string;
  dateOfBirth?: string;
  employmentStatus?: string;
  employer?: string;
  jobTitle?: string;
  monthlyIncome?: number;
  previousAddress?: string;
  previousLandlord?: string;
  previousLandlordPhone?: string;
  previousRentAmount?: number;
  reasonForLeaving?: string;
  reference1Name?: string;
  reference1Phone?: string;
  reference1Relation?: string;
  reference2Name?: string;
  reference2Phone?: string;
  reference2Relation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  additionalNotes?: string;
  // Commercial / business premises application only
  businessName?: string;
  businessBoxNumber?: string;
  physicalAddress?: string;
  faxNumber?: string;
  dateIncorporated?: string;
  operatingFromLastPremisesFor?: string;
  intendedUse?: string;
  numberOfEmployees?: number;
  bankersName?: string;
  bankersBranch?: string;
  bankersAccountNumber?: string;
  directors?: ApplicationDirector[];
}

export interface PublicApplicationInfo {
  token: string;
  alreadySubmitted: boolean;
  unit: {
    unit_number: string;
    rent_amount: number;
    currency: string;
    bedrooms: number | null;
    bathrooms: number | null;
    status: string;
    property: {
      name: string;
      address: string | null;
      suburb: string | null;
      city: string | null;
      type: string;
    };
  };
}

export interface GenerateLinkResult {
  token: string;
  url: string;
  applicationId: string;
  unit: {
    id: string;
    unit_number: string;
    rent_amount: number;
    currency: string;
    property: { name: string; address: string | null };
  };
}

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export function useApplications(status?: string) {
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = async () => {
    setLoading(true);
    const endpoint = status ? `/applications?status=${status}` : "/applications";
    const res = await apiClient<ApplicationListItem[]>(endpoint);
    if (res.success) {
      setApplications(res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, [status]);

  return { applications, loading, error, refetch: fetchApplications };
}

export function useApplication(id: string) {
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplication = async () => {
    setLoading(true);
    const res = await apiClient<ApplicationDetail>(`/applications/${id}`);
    if (res.success) {
      setApplication(res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchApplication();
  }, [id]);

  return { application, loading, error, refetch: fetchApplication };
}
