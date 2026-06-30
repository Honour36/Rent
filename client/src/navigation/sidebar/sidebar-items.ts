import {
  Banknote,
  Building2,
  ChartBar,
  ClipboardList,
  LayoutDashboard,
  type LucideIcon,
  MessageSquare,
  Settings,
  UserCheck,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
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
        url: "/dashboard/payments",
        icon: Banknote,
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
        url: "/dashboard/reports",
        icon: ChartBar,
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
