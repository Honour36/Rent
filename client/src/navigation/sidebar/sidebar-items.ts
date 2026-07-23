import {
  Banknote,
  Building2,
  ChartBar,
  ClipboardCheck,
  ClipboardList,
  FileCheck,
  LayoutDashboard,
  type IconComponent,
  MessageSquare,
  Settings,
  UserCheck,
  UserCog,
  Users,
  Wrench,
} from "@/components/icons";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: IconComponent;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: IconComponent;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Main",
    items: [
      {
        id: "overview",
        title: "Overview",
        url: "/dashboard/overview",
        icon: LayoutDashboard,
      },
      {
        id: "properties",
        title: "Properties",
        url: "/dashboard/properties",
        icon: Building2,
      },
      {
        id: "tenants",
        title: "Tenants",
        url: "/dashboard/tenants",
        icon: Users,
      },
      {
        id: "applications",
        title: "Applications",
        url: "/dashboard/applications",
        icon: ClipboardList,
      },
      {
        id: "payments",
        title: "Payments",
        icon: Banknote,
        subItems: [
          { id: "payments-all", title: "Payments", url: "/dashboard/payments" },
          { id: "payments-deposits", title: "Deposits", url: "/dashboard/deposits" },
          { id: "payments-rent-collections", title: "Rent Collections", url: "/dashboard/rent-collections" },
          { id: "payments-levies", title: "Levies", url: "/dashboard/levies" },
        ],
      },
      {
        id: "inspections",
        title: "Inspections",
        icon: ClipboardCheck,
        subItems: [
          { id: "inspections-all", title: "Inspections", url: "/dashboard/inspections" },
          { id: "inspections-checklists", title: "Checklists", url: "/dashboard/checklists" },
        ],
      },
      {
        id: "leases",
        title: "Leases",
        url: "/dashboard/leases",
        icon: FileCheck,
      },
      {
        id: "communications",
        title: "Communications",
        url: "/dashboard/communications",
        icon: MessageSquare,
      },
      {
        id: "maintenance",
        title: "Maintenance",
        url: "/dashboard/maintenance",
        icon: Wrench,
      },
      {
        id: "reports",
        title: "Reports",
        icon: ChartBar,
        subItems: [
          { id: "reports-hub", title: "All Reports", url: "/dashboard/reports" },
          { id: "reports-owner-statement", title: "Owner Statements", url: "/dashboard/reports/owner-statement" },
          { id: "reports-arrears", title: "Arrears", url: "/dashboard/reports/arrears" },
          { id: "reports-vacancy", title: "Vacancy", url: "/dashboard/reports/vacancy" },
          { id: "reports-lease-expiry", title: "Lease Expiry", url: "/dashboard/reports/lease-expiry" },
          { id: "reports-collection-rate", title: "Collection Rate", url: "/dashboard/reports/collection-rate" },
          { id: "reports-maintenance", title: "Maintenance", url: "/dashboard/reports/maintenance" },
          { id: "reports-trust-ledger", title: "Trust Ledger", url: "/dashboard/reports/trust-ledger" },
        ],
      },
    ],
  },
  {
    id: 2,
    label: "Management",
    items: [
      {
        id: "owners",
        title: "Owners",
        url: "/dashboard/owners",
        icon: UserCheck,
      },
      {
        id: "agents",
        title: "Agents",
        url: "/dashboard/agents",
        icon: UserCog,
      },
      {
        id: "settings",
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];
