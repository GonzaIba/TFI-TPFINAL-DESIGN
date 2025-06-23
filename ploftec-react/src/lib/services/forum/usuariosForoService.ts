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
import { ImageHelper }from '@/lib/helpers'
import { GenericApiResponse } from '@/lib/types/apiResponse';


export const usuariosForoService = {
  async getTopUsersLastWeek(): Promise<GenericApiResponse<UsersForumPreviewResponse[]>> {
    const response = await apiBaseService.execute<UsersForumPreviewResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerTopUsuariosSemana",
      requireCredentials: false,
    });
    return response;
  },

  async obtenerUsuariosForo(): Promise<GenericApiResponse<UsersForumResponse[]>> {
    const response = await apiBaseService.execute<UsersForumResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerUsuariosForos",
      requireCredentials: true,
    });
    return response;
  },

  async obtenerDetalleUsuario(email: string): Promise<GenericApiResponse<DetailsUserForumResponse | null>> {
    const response = await apiBaseService.execute<DetailsUserForumResponse, undefined>({
      method: "GET",
      url: `ApiForum/ObtenerDetalleUsuarioForos?userEmail=${email}`,
      requireCredentials: false,
    });
    
    return response;
  },

  async obtenerFiltrosUsuario(): Promise<GenericApiResponse<UserFilterForumResponse[]>> {
    const response = await apiBaseService.execute<UserFilterForumResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerFiltrosUsuario",
      requireCredentials: true,
    });
    return response;
  },

  async eliminarFiltroUsuario(codigoFiltro: number): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, undefined>({
      method: "DELETE",
      url: `ApiForum/EliminarFiltroUsuario?filterCode=${codigoFiltro}`,
      requireCredentials: true,
    });
    return response;
  },

  async eliminarTodosFiltrosUsuario(grupo: string): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, undefined>({
      method: "DELETE",
      url: `ApiForum/EliminarTodosLosFiltrosUsuario?filter=${grupo}`,
      requireCredentials: true,
    });
    return response;
  },

  async agregarFiltrosUsuario(request: FiltersUserRequest): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, FiltersUserRequest>({
      method: "POST",
      url: "ApiForum/AgregarFiltrosUsuario",
      body: request,
      requireCredentials: true,
    });
    return response;
  },
};