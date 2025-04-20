// src/lib/services/filtrosService.ts
import { apiBaseService } from "../apiBaseService";
import { GroupResponse } from "@/lib/types/forum";
import { GroupEnum } from "@/lib/types/enum";

export const filtrosService = {
  async obtenerGrupoConFiltros(group: GroupEnum): Promise<GroupResponse | null> {
    const response = await apiBaseService.execute<GroupResponse, undefined>({
      method: "GET",
      url: `Filter/ObtenerGrupoPorNombre?filter=${group}`,
      requireCredentials: false,
    });
    return response?.data ?? null;
  },
};