"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

function buildUser(name: string, email: string, role: string, id: string): CurrentUser {
  const seed = encodeURIComponent(name || email || "U");
  return {
    id,
    name: name || email || "Agent",
    email: email || "",
    role: role || "agent",
    avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${seed}`,
  };
}

export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    // access_token is httpOnly (by design, so client-side JS can never read
    // it - keeps it safe from XSS), so there's no cookie shortcut here.
    // /auth/me is the only source of truth, and now that api-client treats
    // it like any other protected endpoint, an expired access token is
    // silently refreshed and this call retried automatically - no more
    // falling back to a placeholder name while the session is still valid.
    apiClient<{ id: string; name: string; email: string; role: string }>("/auth/me")
      .then((res) => {
        if (res.success) {
          const d = (res as any).data;
          setUser(buildUser(d.name, d.email, d.role, d.id));
        }
      })
      .catch(() => {/* silently ignore */});
  }, []);

  return user;
}
