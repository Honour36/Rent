import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Hi",
  tagline: "Property Management, Simplified.",
  version: packageJson.version,
  copyright: `© ${currentYear} Hi Property Manager.`,
  meta: {
    title: "Hi — Property Management for Zimbabwe",
    description:
      "Hi is the modern property management platform for Zimbabwean agents. Manage properties, tenants, payments, receipts, and owner statements — all in one place.",
  },
};
