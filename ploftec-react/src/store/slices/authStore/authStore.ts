import { create } from "zustand";
import { UserApplication } from "@/lib/types/application";

interface AuthState {
  user: UserApplication | null;
  isAuthenticated: boolean;
  setUser: (user: UserApplication) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));
