// src/lib/services/labelsService.ts
import { GenericApiResponse, PaginatedList } from "@/lib/types/apiResponse";
import { apiBaseService } from "../apiBaseService";
import {
  LabelResponse
} from "@/lib/types/forum";
import {
  LabelFiltersEnum
} from "@/lib/types/enum";

export const labelsService = {

  async getLabels(pageIndex: number, pageCount: number)
  : Promise<GenericApiResponse<PaginatedList<LabelResponse>>> {
      const response = await apiBaseService.execute<PaginatedList<LabelResponse>,undefined>({
        method: "GET",
        url: `ApiForum/ObtenerEtiquetas?pageIndex=${pageIndex}&pageCount=${pageCount}`,
        requireCredentials: true,
        forceLogoutIfException: false
      });
      return response;
    },

  async getLabelsByName(search: string, pageIndex: number, pageCount: number)
  : Promise<GenericApiResponse<PaginatedList<LabelResponse>>> {
    const response = await apiBaseService.execute<PaginatedList<LabelResponse>,undefined>({
      method: "GET",
      url: `ApiForum/ObtenerEtiquetasPorNombre?rawQuery=${search}&pageIndex=${pageIndex}&pageCount=${pageCount}`,
      requireCredentials: true,
      forceLogoutIfException: false
    });
    return response;
  },

  async getLabelsByFilter(filter: LabelFiltersEnum, pageIndex: number, pageCount: number)
  : Promise<GenericApiResponse<PaginatedList<LabelResponse>>> {
    const response = await apiBaseService.execute<PaginatedList<LabelResponse>,undefined>({
      method: "GET",
      url: `ApiForum/ObtenerEtiquetasPorFiltro?filterEnum=${filter}&pageIndex=${pageIndex}&pageCount=${pageCount}`,
      requireCredentials: true,
      forceLogoutIfException: false
    });
    return response;
  },
};