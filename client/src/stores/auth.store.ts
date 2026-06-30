import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "senior_agent" | "junior_agent";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
