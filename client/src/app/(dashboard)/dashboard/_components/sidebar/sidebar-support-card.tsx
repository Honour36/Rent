"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SystemNotification {
  id: string;
  message: string;
  type: "info" | "warning" | "success";
  timestamp: Date;
}

function generateNotifications(): SystemNotification[] {
  const now = new Date();
  return [
    {
      id: "1",
      message: "Rent reminders will be sent on the 1st.",
      type: "info",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2),
    },
    {
      id: "2",
      message: "System online and synced.",
      type: "success",
      timestamp: new Date(now.getTime() - 1000 * 60 * 30),
    },
  ];
}

export function SidebarSupportCard() {
  const [notifications] = useState<SystemNotification[]>(generateNotifications);
  const [expanded, setExpanded] = useState(false);

  const typeColor: Record<string, string> = {
    info: "text-blue-600",
    warning: "text-amber-600",
    success: "text-green-600",
  };

  return (
    <Card
      size="sm"
      className="overflow-hidden shadow-none group-data-[collapsible=icon]:hidden cursor-pointer"
      onClick={() => setExpanded((v) => !v)}
    >
      <CardHeader className="min-w-0 px-4 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="truncate text-sm flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            Notifications
          </CardTitle>
          <Badge variant="secondary" className="text-xs px-1.5 py-0">{notifications.length}</Badge>
        </div>

        {expanded && (
          <div className="mt-2 space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className="text-xs">
                <span className={typeColor[n.type] ?? "text-muted-foreground"}>●</span>{" "}
                <span className="text-foreground">{n.message}</span>
                <div className="text-muted-foreground ml-3">
                  {n.timestamp.toLocaleTimeString("en-ZW", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        )}

        {!expanded && (
          <CardDescription className="line-clamp-1 text-xs mt-0.5">
            {notifications[notifications.length - 1]?.message}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}
