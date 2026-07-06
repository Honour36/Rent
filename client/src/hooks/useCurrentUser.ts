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

function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
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
    // 1. Try JWT first (instant — no network round trip)
    const token = getTokenFromCookie();
    if (token) {
      const payload = parseJwtPayload(token);
      if (payload?.name && payload?.email) {
        setUser(buildUser(payload.name, payload.email, payload.role, payload.sub));
        return; // JWT has what we need — done
      }
    }

    // 2. Fallback: fetch /me from backend (covers old JWTs without name/email)
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
