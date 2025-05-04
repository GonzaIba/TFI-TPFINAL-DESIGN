"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuthStore } from "../store/slices/authStore/authStore";
import { getUserDetails } from "@/lib/services/auth/authenticationService";
import { GenericApiResponse } from "@/lib/types/apiResponse";
import { UserApplication } from "@/lib/types/application";

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res: UserApplication | undefined = await getUserDetails();

        if (res) {
          setUser(res);
        }
      } catch (error) {
        // No hace nada, simplemente no hay sesión activa
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [setUser]);

  if (loading) return null; // O podés poner un loader si querés

  return <>{children}</>;
};
