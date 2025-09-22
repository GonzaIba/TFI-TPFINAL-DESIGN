// src/lib/services/apiBaseService.ts
import axios, { AxiosRequestConfig } from "axios";
import { GenericApiResponse } from "@/lib/types/apiResponse";
import { LoginRequest } from "@/lib/types/auth";
import { ExceptionBase } from "../types/exception";
import { UserApplication } from "../types/application";
import { getMappedError } from "@/lib/utils/getMappedError";
import { getClientIp } from '@/lib/utils/getClientIp';
import useErrorStore from "@/store/slices/snackBarStore/snackbarStore";
import useAuthStore from "@/store/slices/authStore/authStore";

export type ApiRequest<T> = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  body?: T;
  requireCredentials?: boolean;
  forceLogoutIfException?: boolean;
  handleError?: boolean; // default true
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

function getInternalErrorHandler() {
  const { showToast, showModal } = useErrorStore.getState();
  return (errors: ExceptionBase[]) => {
    const mapped = getMappedError(errors);
    if (!mapped) return;

    const { exception, config } = mapped;
    switch (config.type) {
      case "toast":
        showToast({ message: exception.message || "Error inesperado", variant: "error" });
        break;
      case "modal":
        showModal({
          title: exception.title || "Error",
          message: exception.message || "Algo salió mal",
          image: exception.image || null,
        });
        break;
    }
  };
}


export const apiBaseService = {
  async execute<EntityResponse, T>(req: ApiRequest<T>): Promise<GenericApiResponse<EntityResponse>> {
    try {
      //const userAgent = navigator.userAgent;
      const ip = await getClientIp();

      const config: AxiosRequestConfig = {
        method: req.method,
        url: `${process.env.NEXT_PUBLIC_API_URL}/${req.url}`,
        headers: {
          "Content-Type": "application/json",
          //"User-Agent": userAgent, --> no lo agregamos porque lo hace el navegador automáticamente
          "X-Client-IP": ip ?? "",
          "X-Page-Path": window.location.pathname,
        },
        withCredentials: req.requireCredentials ?? false,
        data: req.body ?? undefined,
      };

      const res = await axios.request<GenericApiResponse<EntityResponse>>(config);

      // if (res.data.errors?.errorsList?.length > 0 && req?.handleError !== false) {
      //   getInternalErrorHandler()(res.data.errors.errorsList);
      // }

      return res.data;
    } catch (error: any) {

      if (error.response?.data?.errors?.errorsList?.some((e: ExceptionBase) => e.nameError === "InvalidTokenException")) {
        // En caso de token inválido, limpiamos el estado de autenticación
        // y NO redirigimos automáticamente. El layout mostrará login/registro.
        try {
          const { clearUser } = useAuthStore.getState();
          clearUser();
        } catch {}
        
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
