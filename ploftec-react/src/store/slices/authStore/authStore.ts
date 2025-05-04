import { create } from "zustand";
import { UserApplication } from "@/lib/types/application";

interface AuthState {
  user: UserApplication | null;
  isAuthenticated: boolean;
  isAuthLoaded: boolean;
  setUser: (user: UserApplication) => void;
  clearUser: () => void;
  setAuthLoaded: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthLoaded: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
  setAuthLoaded: () => set({ isAuthLoaded: true }),
}));
