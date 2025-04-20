"use client";

import { apiBaseService } from "../apiBaseService";
import { LoginRequest, RegisterRequest, ProvidersEnum } from "@/lib/types/auth";

export const login = async (data: LoginRequest) => {
  const response = await apiBaseService.login(data);
  console.log(response);
  return response.data;
};

export const logout = async () => {
  await apiBaseService.logout();
};

export const register = async (data: RegisterRequest) => {
  return await apiBaseService.execute<object, RegisterRequest>({
    url: "Auth/Register",
    method: "POST",
    body: data,
    requireCredentials: true,
  });
};

export const getUserDetails = async () => {
  return (await apiBaseService.me()).data;
};

export const authenticateExternal = async (provider: ProvidersEnum) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  window.location.href = `${baseUrl}/Auth/ExternalLogin?provider=${provider}`;
};
