"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Building2, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface ContextualNotification {
  id: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  action?: string;
  actionUrl?: string;
}

async function fetchContextualNotifications(): Promise<ContextualNotification[]> {
  const notes: ContextualNotification[] = [];

  try {
    // Check for properties with no units
    const propsRes = await apiClient<any[]>("/properties");
    if (propsRes.success) {
      const noUnits = (propsRes as any).data?.filter((p: any) => !p.units || p.units.length === 0) ?? [];
      if (noUnits.length > 0) {
        notes.push({
          id: "no-units",
          message: `${noUnits.length} propert${noUnits.length === 1 ? "y" : "ies"} without units`,
          type: "warning",
          action: noUnits.length === 1 ? `Open "${noUnits[0].name}" to add units` : "Click each highlighted property to add units",
          actionUrl: noUnits.length === 1 ? `/dashboard/properties/${noUnits[0].id}` : "/dashboard/properties",
        });
      }
    }

    // Check for vacant units across all properties
    const allUnits: any[] = (propsRes as any).data?.flatMap((p: any) => p.units ?? []) ?? [];
    const vacantCount = allUnits.filter((u: any) => u.status === "vacant").length;
    if (vacantCount > 0) {
      notes.push({
        id: "vacant-units",
        message: `${vacantCount} vacant unit${vacantCount > 1 ? "s" : ""} available`,
        type: "info",
        action: "Generate application links to fill vacancies",
        actionUrl: "/dashboard/properties",
      });
    }

    // Check maintenance
    const maintRes = await apiClient<any>("/maintenance?status=open");
    if (maintRes.success) {
      const open = (maintRes as any).data?.records?.length ?? 0;
      if (open > 0) {
        notes.push({
          id: "open-maintenance",
          message: `${open} open maintenance request${open > 1 ? "s" : ""}`,
          type: open >= 3 ? "error" : "warning",
          action: "Review and assign requests",
          actionUrl: "/dashboard/maintenance",
        });
      }
    }

    // Check applications
    const appsRes = await apiClient<any>("/applications?status=pending");
    if (appsRes.success) {
      const pending = (appsRes as any).data?.length ?? (appsRes as any).data?.applications?.length ?? 0;
      if (pending > 0) {
        notes.push({
          id: "pending-apps",
          message: `${pending} pending tenant application${pending > 1 ? "s" : ""}`,
          type: "info",
          action: "Review applications",
          actionUrl: "/dashboard/applications",
        });
      }
    }

    // Check account receipt readiness
    const accRes = await apiClient<any>("/settings/account");
    if (accRes.success) {
      const acc = (accRes as any).data;
      if (!acc?.address || !acc?.phone || !acc?.email) {
        notes.push({
          id: "account-incomplete",
          message: "Account details incomplete",
          type: "warning",
          action: "Fill in address, phone & email to enable receipt printing.",
          actionUrl: "/dashboard/settings?tab=account",
        });
      }
    }

    if (notes.length === 0) {
      notes.push({ id: "all-good", message: "All systems in order.", type: "success" });
    }
  } catch {
    notes.push({ id: "system", message: "System online.", type: "success" });
  }

  return notes;
}

const typeIcon: Record<string, React.ElementType> = {
  info: Building2,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertTriangle,
};

const typeColor: Record<string, string> = {
  info: "text-blue-600 dark:text-blue-400",
  warning: "text-amber-600 dark:text-amber-400",
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
};

export function SidebarSupportCard() {
  const [notifications, setNotifications] = useState<ContextualNotification[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [shown, setShown] = useState(false);

  const load = useCallback(async () => {
    const notes = await fetchContextualNotifications();
    setNotifications(notes);

    // Fire Sonner toast for warnings/errors on first load
    if (!shown) {
      notes.forEach((n) => {
        if (n.type === "warning" || n.type === "error") {
          toast[n.type === "error" ? "error" : "warning"](n.message, {
            description: n.action,
            duration: 8000,
            ...(n.actionUrl && {
              action: {
                label: "Fix now →",
                onClick: () => window.location.assign(n.actionUrl!),
              },
            }),
          });
        }
        // Fire an info toast for pending applications (once per session)
        if (n.id === "pending-apps" && typeof sessionStorage !== "undefined") {
          const key = `notified-apps-${n.message}`;
          if (!sessionStorage.getItem(key)) {
            toast.info("New application received!", {
              description: n.message + " — review in Applications.",
              duration: 8000,
              action: { label: "Review", onClick: () => window.location.assign("/dashboard/applications") },
            });
            sessionStorage.setItem(key, "1");
          }
        }
      });
      setShown(true);
    }
  }, [shown]);

  useEffect(() => {
    load();
    // Refresh every 5 minutes
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const unread = notifications.filter((n) => n.type === "warning" || n.type === "error").length;

  return (
    <Card
      size="sm"
      className="overflow-hidden shadow-none group-data-[collapsible=icon]:hidden cursor-pointer select-none"
      onClick={() => setExpanded((v) => !v)}
    >
      <CardHeader className="min-w-0 px-4 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="truncate text-sm flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            Reminders
          </CardTitle>
          {unread > 0
            ? <Badge variant="destructive" className="text-xs px-1.5 py-0">{unread}</Badge>
            : <Badge variant="secondary" className="text-xs px-1.5 py-0">{notifications.length}</Badge>}
        </div>

        {!expanded && (
          <CardDescription className="line-clamp-1 text-xs mt-0.5">
            {notifications[0]?.message ?? "Loading…"}
          </CardDescription>
        )}

        {expanded && (
          <div className="mt-2 space-y-2.5">
            {notifications.map((n) => {
              const Icon = typeIcon[n.type] ?? Bell;
              return (
                <div
                  key={n.id}
                  className={cn("text-xs rounded", n.actionUrl && "cursor-pointer hover:opacity-80")}
                  onClick={n.actionUrl ? (e) => { e.stopPropagation(); window.location.assign(n.actionUrl!); } : undefined}
                >
                  <div className={cn("flex items-start gap-1.5 font-medium", typeColor[n.type])}>
                    <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{n.message}</span>
                  </div>
                  {n.action && (
                    <p className={cn("ml-5 mt-0.5 leading-tight", typeColor[n.type])}>{n.action}</p>
                  )}
                  {n.actionUrl && (
                    <p className={cn("ml-5 mt-0.5 text-[10px] underline underline-offset-2", typeColor[n.type])}>
                      Click to fix →
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardHeader>
    </Card>
  );
}
