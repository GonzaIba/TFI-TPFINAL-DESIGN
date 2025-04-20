// src/lib/services/usuariosForoService.ts
import { apiBaseService } from "../apiBaseService";
import {
  UsersForumPreviewResponse,
  UsersForumResponse,
  DetailsUserForumResponse,
  UserFilterForumResponse,
  SuccessfulResponse,
  FiltersUserRequest,
} from "@/lib/types/forum";

export const usuariosForoService = {
  async obtenerTopUsuariosUltimaSemana(): Promise<UsersForumPreviewResponse[]> {
    const response = await apiBaseService.execute<UsersForumPreviewResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerTopUsuariosSemana",
      requireCredentials: false,
    });
    return response.data ?? [];
  },

  async obtenerUsuariosForo(): Promise<UsersForumResponse[]> {
    const response = await apiBaseService.execute<UsersForumResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerUsuariosForos",
      requireCredentials: true,
    });
    return response.data ?? [];
  },

  async obtenerDetalleUsuario(email: string): Promise<DetailsUserForumResponse | null> {
    const response = await apiBaseService.execute<DetailsUserForumResponse, undefined>({
      method: "GET",
      url: `ApiForum/ObtenerDetalleUsuarioForos?userEmail=${email}`,
      requireCredentials: false,
    });
    return response.data ?? null;
  },

  async obtenerFiltrosUsuario(): Promise<UserFilterForumResponse[]> {
    const response = await apiBaseService.execute<UserFilterForumResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerFiltrosUsuario",
      requireCredentials: true,
    });
    return response.data ?? [];
  },

  async eliminarFiltroUsuario(codigoFiltro: number): Promise<SuccessfulResponse> {
    const response = await apiBaseService.execute<SuccessfulResponse, undefined>({
      method: "DELETE",
      url: `ApiForum/EliminarFiltroUsuario?filterCode=${codigoFiltro}`,
      requireCredentials: true,
    });
    return response.data ?? { success: false };
  },

  async eliminarTodosFiltrosUsuario(grupo: string): Promise<SuccessfulResponse> {
    const response = await apiBaseService.execute<SuccessfulResponse, undefined>({
      method: "DELETE",
      url: `ApiForum/EliminarTodosLosFiltrosUsuario?filter=${grupo}`,
      requireCredentials: true,
    });
    return response.data ?? { success: false };
  },

  async agregarFiltrosUsuario(request: FiltersUserRequest): Promise<SuccessfulResponse> {
    const response = await apiBaseService.execute<SuccessfulResponse, FiltersUserRequest>({
      method: "POST",
      url: "ApiForum/AgregarFiltrosUsuario",
      body: request,
      requireCredentials: true,
    });
    return response.data ?? { success: false };
  },
};