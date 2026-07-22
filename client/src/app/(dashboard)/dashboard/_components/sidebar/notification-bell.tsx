"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "@/components/icons";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { apiClient } from "@/lib/api-client";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
}

// Where a click on a notification of this type should take the agent.
function entityHref(n: NotificationItem): string | null {
  if (n.entity_type === "application" && n.entity_id) return `/dashboard/applications/${n.entity_id}`;
  if (n.entity_type === "rent_collection_request") return "/dashboard/rent-collections";
  if (n.entity_type === "maintenance_request" && n.entity_id) return `/dashboard/maintenance/${n.entity_id}`;
  return null;
}

export function NotificationBell() {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const fetchCount = () => {
    apiClient<{ count: number }>("/notifications/count").then((res) => {
      if (res.success) setCount((res as any).data?.count ?? 0);
    });
  };

  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, 30_000);
    return () => clearInterval(id);
  }, []);

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (v) {
      apiClient<NotificationItem[]>("/notifications?limit=10").then((res) => {
        if (res.success) setItems((res as any).data ?? []);
      });
    }
  };

  const handleClick = async (n: NotificationItem) => {
    if (!n.is_read) {
      await apiClient(`/notifications/${n.id}/read`, { method: "PATCH" });
      fetchCount();
    }
    setOpen(false);
    const href = entityHref(n);
    if (href) router.push(href);
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px]">
              {count > 99 ? "99+" : count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          items.map((n) => (
            <DropdownMenuItem
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex flex-col items-start gap-0.5 whitespace-normal py-2 ${!n.is_read ? "bg-muted/50" : ""}`}
            >
              <span className="text-sm font-medium">{n.title}</span>
              <span className="text-xs text-muted-foreground">{n.body}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
