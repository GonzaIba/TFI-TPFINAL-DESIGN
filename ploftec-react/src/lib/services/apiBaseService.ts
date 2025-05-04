// src/lib/services/apiBaseService.ts
import axios, { AxiosRequestConfig } from "axios";
import { GenericApiResponse } from "@/lib/types/apiResponse";
import { LoginRequest } from "@/lib/types/auth";
import { ExceptionBase } from "../types/exception";
import { UserApplication } from "../types/application";

export type ApiRequest<T> = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  body?: T;
  requireCredentials?: boolean;
  forceLogoutIfException?: boolean;
};

// Servicio externo para obtener IP pública
const getIpAddress = async (): Promise<string | null> => {
  try {
    const res = await axios.get("https://api.ipify.org?format=json");
    return res?.data?.ip ?? "";
  } catch {
    return null;
  }
};

export const apiBaseService = {
  async execute<EntityResponse, T>(req: ApiRequest<T>): Promise<GenericApiResponse<EntityResponse>> {
    try {
      const userAgent = navigator.userAgent;
      const ip = await getIpAddress();

      const config: AxiosRequestConfig = {
        method: req.method,
        url: `${process.env.NEXT_PUBLIC_API_URL}/${req.url}`,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "X-Client-IP": ip ?? "",
        },
        withCredentials: req.requireCredentials ?? false,
        data: req.body ?? undefined,
      };

      const res = await axios.request<GenericApiResponse<EntityResponse>>(config);
      return res.data;
    } catch (error: any) {

      if (error.response?.data?.errors?.errorsList?.some((e: ExceptionBase) => e.nameError === "InvalidTokenException")) {
        if (req.forceLogoutIfException !== false) {
          await apiBaseService.logout();
        }
      }

      throw error;
    }
  },

  async login(data: LoginRequest): Promise<GenericApiResponse<UserApplication>> {
    return await apiBaseService.execute<UserApplication, LoginRequest>({
      method: "POST",
      url: "Auth/Login",
      body: data,
      requireCredentials: true,
    });
  },

  async logout(): Promise<void> {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/Auth/Logout`, {}, { withCredentials: true });
    }
    catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
    window.location.href = "/login";
  },

  async me(): Promise<GenericApiResponse<UserApplication>> {
    return await apiBaseService.execute<UserApplication, undefined>({
      method: "GET",
      url: "Auth/Me",
      requireCredentials: true,
      forceLogoutIfException: false,
    });
  },
};
