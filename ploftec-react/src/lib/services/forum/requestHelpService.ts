// src/lib/services/publicacionesService.ts
import { CursorPage, GenericApiResponse } from "@/lib/types/apiResponse";
import { apiBaseService } from "../apiBaseService";
import {
  CreatePublicationRequest,
  AnswerVoteRequest,
  PublicationVoteRequest,
  AddAnswerRequest,
  DeleteAnswerRequest,
  EditAnswerRequest,
  PublicationDetailResponse,
  PublicationResponse,
  SuccessfulResponse,
  AnswerPublicationVoteResponse,
  AnswerResponse,
  RequestHelpResponse,
  CreateHelpRequest
} from "@/lib/types/forum";

export const requestHelpService = {
  async getRequestsHelp(limit=8, after?: string, anchorUtc?: string, search?: string): Promise<GenericApiResponse<CursorPage<RequestHelpResponse>>> {
    const p = new URLSearchParams({ limit: String(limit) });
    if (after) p.set("after", after);
    if (anchorUtc) p.set("anchorUtc", anchorUtc);
    if (search) p.set("search", search);
    const response = await apiBaseService.execute<CursorPage<RequestHelpResponse>, undefined>({
      method: "GET",
      url: `ApiForum/ObtenerSolicitudesDeAyuda?${p}`,
      requireCredentials: true,
    });
    return response;
  },
  
  async createHelpRequest(request: CreateHelpRequest): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, CreateHelpRequest>({
      method: "POST",
      url: `ApiForum/CrearSolicitudAyuda`,
      requireCredentials: true,
      body: request,
    });
    return response;
  },
};
