import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Rental",
  tagline: "Property Management, Simplified.",
  version: packageJson.version,
  copyright: `© ${currentYear} Rental. All rights reserved.`,
  meta: {
    title: "Rental — Property Management for Zimbabwe",
    description:
      "Rental is the modern property management platform for Zimbabwean agents. Manage properties, tenants, payments, receipts, and owner statements — all in one place.",
  },
};
