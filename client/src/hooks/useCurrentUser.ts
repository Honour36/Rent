"use client";

import { useEffect, useState } from "react";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  /** Falls back to a generated avatar URL */
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

export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const token = getTokenFromCookie();
    if (!token) return;
    const payload = parseJwtPayload(token);
    if (!payload) return;

    const name = payload.fullName ?? payload.full_name ?? payload.name ?? "Agent";
    const email = payload.email ?? "";
    const role = payload.role ?? "agent";
    const seed = encodeURIComponent(name);

    setUser({
      id: payload.sub ?? "",
      name,
      email,
      role,
      avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${seed}`,
    });
  }, []);

  return user;
}
