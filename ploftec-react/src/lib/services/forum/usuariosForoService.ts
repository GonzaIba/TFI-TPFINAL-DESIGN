// src/lib/services/usuariosForoService.ts
import { apiBaseService } from "../apiBaseService";
import {
  UsersForumPreviewResponse,
  UsersForumResponse,
  DetailsUserForumResponse,
  UserFilterForumResponse,
  SuccessfulResponse,
  NotificationsResponse,
  FiltersUserRequest,
  MarkNotificationAsReadRequest
} from "@/lib/types/forum";
import { ImageHelper }from '@/lib/helpers'
import { GenericApiResponse, PaginatedList } from '@/lib/types/apiResponse';


export const usuariosForoService = {
  async getTopUsersLastWeek(): Promise<GenericApiResponse<UsersForumPreviewResponse[]>> {
    const response = await apiBaseService.execute<UsersForumPreviewResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerTopUsuariosSemana",
      requireCredentials: false,
    });
    return response;
  },

  async getUsersForum(pageIndex:number, pageCount:number): Promise<GenericApiResponse<PaginatedList<UsersForumResponse>>> {
    const response = await apiBaseService.execute<PaginatedList<UsersForumResponse>, undefined>({
      method: "GET",
      url: `ApiForum/ObtenerUsuariosForos?pageIndex=${pageIndex}&pageCount=${pageCount}`,
      requireCredentials: true,
    });
    return response;
  },

  async getDetailUser(email: string): Promise<GenericApiResponse<DetailsUserForumResponse>> {
    const response = await apiBaseService.execute<DetailsUserForumResponse, undefined>({
      method: "GET",
      url: `ApiForum/ObtenerDetalleUsuarioForos?userEmail=${email}`,
      requireCredentials: false,
    });
    
    return response;
  },

  async getFilterUser(): Promise<GenericApiResponse<UserFilterForumResponse[]>> {
    const response = await apiBaseService.execute<UserFilterForumResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerFiltrosUsuario",
      requireCredentials: true,
    });
    return response;
  },

  async deleteFilterUser(codigoFiltro: number): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, undefined>({
      method: "DELETE",
      url: `ApiForum/EliminarFiltroUsuario?filterCode=${codigoFiltro}`,
      requireCredentials: true,
    });
    return response;
  },

  async deleteAllFiltersUser(grupo: string): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, undefined>({
      method: "DELETE",
      url: `ApiForum/EliminarTodosLosFiltrosUsuario?filter=${grupo}`,
      requireCredentials: true,
    });
    return response;
  },

  async addFilterUser(request: FiltersUserRequest): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, FiltersUserRequest>({
      method: "POST",
      url: "ApiForum/AgregarFiltrosUsuario",
      body: request,
      requireCredentials: true,
    });
    return response;
  },

  async getNotifications(): Promise<GenericApiResponse<NotificationsResponse[]>> {
    const response = await apiBaseService.execute<NotificationsResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerNotificacionesForo",
      requireCredentials: true,
    });
    return response;
  },

  async markNotificationAsRead(body: MarkNotificationAsReadRequest): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, MarkNotificationAsReadRequest>({
      method: "POST",
      url: "ApiForum/MarcarNotificacionForoLeida",
      body: body,
      requireCredentials: true,
    });
    return response;
  },
};