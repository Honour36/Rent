import { Metadata } from "next";
import { APP_CONFIG } from "@/config/app-config";
import { SUBSCRIPTION_TIERS } from "@/config/subscription-tiers";
import RentalLandingClient from "./landing-client";

export const metadata: Metadata = {
  title: APP_CONFIG.meta.title,
  description: APP_CONFIG.meta.description,
};

export default function LandingPage() {
  return <RentalLandingClient tiers={SUBSCRIPTION_TIERS} />;
}
