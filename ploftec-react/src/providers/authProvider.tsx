"use client";

import React, { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import useAuthStore from "../store/slices/authStore/authStore";
import { getUserDetails } from "@/lib/services/auth/authenticationService";

type Props = {
  children: ReactNode;
};

export const AuthProvider = React.memo(({ children }: Props) => {
  const pathname = usePathname();
  const isAuthLoaded = useAuthStore((state) => state.isAuthLoaded);
  const setUser = useAuthStore((state) => state.setUser);
  const setAuthLoaded = useAuthStore((state) => state.setAuthLoaded);

  console.log("-----------Render AuthProvider-----------");

  useEffect(() => {
    if (pathname === "/login" || isAuthLoaded) return;

    console.log("-----------AuthProvider fetching session-----------");

    const fetchSession = async () => {
      try {
        const res = await getUserDetails();
        if (res?.email) {
          console.log("User details fetched", res);
          setUser(res);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setAuthLoaded();
      }
    };

    fetchSession();
  }, [pathname, isAuthLoaded, setUser, setAuthLoaded]);

  useEffect(() => {
    console.log("Effect ejecutado");
  }, []);

  if (pathname !== "/login" && !isAuthLoaded) return null;

  return <>{children}</>;
});
