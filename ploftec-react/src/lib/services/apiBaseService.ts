// src/lib/services/apiBaseService.ts
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

export const apiBaseService = {
  async execute<EntityResponse, T>(req: ApiRequest<T>): Promise<GenericApiResponse<EntityResponse>> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${req.url}`, {
        method: req.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: req.body ? JSON.stringify(req.body) : undefined,
      });

      const json = await res.json();

      if (!res.ok && json.errors?.errorsList?.some((e: ExceptionBase) => e.nameError === "InvalidTokenException")) {
        if (req.forceLogoutIfException !== false) {
          await apiBaseService.logout();
        }
      }

      return json;
    } catch (error) {
      throw error;
    }
  },

  async login(data: LoginRequest): Promise<GenericApiResponse<UserApplication>> {
    return await apiBaseService.execute<UserApplication, LoginRequest>({
      method: "POST",
      url: "Auth/Login",
      body: data,
      requireCredentials: false,
    });
  },

  async logout(): Promise<void> {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Auth/Logout`, {
      method: "POST",
      credentials: "include",
    });
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
