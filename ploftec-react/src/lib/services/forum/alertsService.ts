import { apiBaseService } from "../apiBaseService";
import { GenericApiResponse } from "@/lib/types/apiResponse";
import { ForumAlert } from "@/lib/types/alerts";

export const alertsService = {
  async getAlerts(): Promise<GenericApiResponse<ForumAlert[]>> {
    return await apiBaseService.execute<ForumAlert[], undefined>({
      method: "GET",
      url: "ApiForum/Alertas",
      requireCredentials: true,
      forceLogoutIfException: false,
    });
  },
};
