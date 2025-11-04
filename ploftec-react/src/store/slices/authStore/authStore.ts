'use client'

import React from 'react';
import { create } from "zustand";
import { UserApplication } from "@/lib/types/application";
import zustymiddleware from 'zustymiddleware';

interface AuthState {
  user: UserApplication | null;
  role: string | null;
  isAuthenticated: boolean;
  isAuthLoaded: boolean;
  setUser: (user: UserApplication) => void;
  clearUser: () => void;
  setAuthLoaded: () => void;
  setRole: (role: string | null) => void;
}

const useAuthStore = create<AuthState>(zustymiddleware((set:any) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isAuthLoaded: false,
  setUser: (user:UserApplication) => set({ user, role: user?.roleName ?? null, isAuthenticated: true }),
  clearUser: () => set({ user: null, role: null, isAuthenticated: false }),
  setAuthLoaded: () => set({ isAuthLoaded: true }),
  setRole: (role: string | null) => set({ role }),
})));

// Solo en cliente
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.store = useAuthStore;
}

export default useAuthStore;
