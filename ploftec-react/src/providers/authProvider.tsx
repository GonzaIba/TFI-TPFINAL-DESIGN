"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuthStore } from "../store/slices/authStore/authStore";
import { getUserDetails } from "@/lib/services/auth/authenticationService";

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthLoaded = useAuthStore((state) => state.isAuthLoaded);
  const setAuthLoaded = useAuthStore((state) => state.setAuthLoaded);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider mounted", isAuthLoaded);
    if (isAuthLoaded) return;
  
    const fetchSession = async () => {
      try {
        const res = await getUserDetails();
        if (res?.email) {
          console.log("User details fetched", res);
          setUser(res);
        }
      } finally {
        setAuthLoaded();
        // setLoading(false);
      }
    };
  
    fetchSession();
  }, [isAuthLoaded]);
  
  return <>{children}</>;
};
