'use client'

import React from 'react';
import { create } from "zustand";
import { UserApplication } from "@/lib/types/application";
import zustymiddleware from 'zustymiddleware';

interface AuthState {
  user: UserApplication | null;
  isAuthenticated: boolean;
  isAuthLoaded: boolean;
  setUser: (user: UserApplication) => void;
  clearUser: () => void;
  setAuthLoaded: () => void;
}

const useAuthStore = create<AuthState>(zustymiddleware((set:any) => ({
  user: null,
  isAuthenticated: false,
  isAuthLoaded: false,
  setUser: (user:UserApplication) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
  setAuthLoaded: () => set({ isAuthLoaded: true }),
})));

// Solo en cliente
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.store = useAuthStore;
}

export default useAuthStore;