import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "PropManager",
  version: packageJson.version,
  copyright: `© ${currentYear}, PropManager.`,
  meta: {
    title: "PropManager — Zimbabwe Property Management",
    description:
      "PropManager is a property management platform for Zimbabwean agents. Manage properties, tenants, payments, receipts, and owner statements — all in real time.",
  },
};
