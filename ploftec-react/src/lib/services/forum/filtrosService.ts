// src/lib/services/filtrosService.ts
import { apiBaseService } from "../apiBaseService";
import { 
  GroupResponse,
  UserFilterForumResponse,
  SuccessfulResponse,
  FiltersUserRequest,
} from "@/lib/types/forum";
import { GenericApiResponse } from '@/lib/types/apiResponse';
import { GroupEnum } from "@/lib/types/enum";

export const filtrosService = {
  async getGroupByName(group: GroupEnum): Promise<GroupResponse | null> {
    const response = await apiBaseService.execute<GroupResponse, undefined>({
      method: "GET",
      url: `Filter/ObtenerGrupoPorNombre?filter=${group}`,
      requireCredentials: false,
    });
    return response?.data ?? null;
  },

  async getFilterUser(group: GroupEnum): Promise<GenericApiResponse<UserFilterForumResponse[]>> {
    const response = await apiBaseService.execute<UserFilterForumResponse[], undefined>({
      method: "GET",
      url: `Filter/ObtenerFiltrosUsuario?group=${group}`,
      requireCredentials: true,
    });
    return response;
  },

  async deleteFilterUser(codigoFiltro: number): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, undefined>({
      method: "DELETE",
      url: `Filter/EliminarFiltroUsuario?filterCode=${codigoFiltro}`,
      requireCredentials: true,
    });
    return response;
  },

  async deleteAllFiltersUser(grupo: string): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, undefined>({
      method: "DELETE",
      url: `Filter/EliminarTodosLosFiltrosUsuario?filter=${grupo}`,
      requireCredentials: true,
    });
    return response;
  },

  async addFilterUser(request: FiltersUserRequest): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, FiltersUserRequest>({
      method: "POST",
      url: "Filter/AgregarFiltrosUsuario",
      body: request,
      requireCredentials: true,
    });
    return response;
  },
};