// src/lib/services/publicacionesService.ts
import { apiBaseService } from "../apiBaseService";
import {
  PublicationDetailResponse,
  PublicationResponse,
  SuccessfulResponse,
} from "@/lib/types/forum";

export const publicacionesService = {
  async obtenerPublicaciones(): Promise<PublicationResponse[]> {
    const response = await apiBaseService.execute<PublicationResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerPublicaciones",
      requireCredentials: true,
    });
    return response.data ?? [];
  },

  async obtenerDetallePublicacion(code: number): Promise<PublicationDetailResponse> {
    const response = await apiBaseService.execute<PublicationDetailResponse, undefined>({
      method: "GET",
      url: `ApiForum/ObtenerDetallePublicacion?codePublication=${code}`,
      requireCredentials: false,
    });
    return response?.data ?? {};
  },

  async obtenerPublicacionesCreadas(): Promise<PublicationResponse[]> {
    const response = await apiBaseService.execute<PublicationResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerPublicacionesCreadasPorUsuario",
      requireCredentials: true,
    });
    return response.data ?? [];
  },

  async obtenerPublicacionesGuardadas(): Promise<PublicationResponse[]> {
    const response = await apiBaseService.execute<PublicationResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerPublicacionesGuardadas",
      requireCredentials: true,
      forceLogoutIfException: true,
    });
    return response.data ?? [];
  },

  async buscarPublicacionesConFiltro(texto: string): Promise<PublicationResponse[]> {
    const response = await apiBaseService.execute<PublicationResponse[], undefined>({
      method: "GET",
      url: `ApiForum/BuscarPublicacionesConFiltro?texto=${texto}`,
      requireCredentials: false,
    });
    return response.data ?? [];
  },

  async guardarPublicacion(code: number): Promise<boolean> {
    const response = await apiBaseService.execute<SuccessfulResponse, undefined>({
      method: "POST",
      url: `ApiForum/GuardarPublicacion?publicationCode=${code}`,
      requireCredentials: true,
    });
    return response.data?.success ?? false;
  },

  async eliminarPublicacionGuardada(code: number): Promise<boolean> {
    const response = await apiBaseService.execute<SuccessfulResponse, undefined>({
      method: "DELETE",
      url: `ApiForum/EliminarPublicacionGuardada?publicationCode=${code}`,
      requireCredentials: true,
    });
    return response.data?.success ?? false;
  },
};