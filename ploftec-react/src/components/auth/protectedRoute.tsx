"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/slices/authStore/authStore";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoaded = useAuthStore((state) => state.isAuthLoaded);

  useEffect(() => {
    if (isAuthLoaded && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthLoaded, isAuthenticated, router]);

  if (!isAuthLoaded) return null; // o spinner si querés
  if (!isAuthenticated) return null; // evitamos parpadeo mientras redirige

  return <>{children}</>;
}
