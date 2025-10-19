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
  CreateHelpRequest,
  ConfirmHelpRequestPayload,
  RequestHelpDetailResponse,
  UpdateDisponibilityRequest,
  RequestHelpConfirmedResponse,
} from "@/lib/types/forum";

export const requestHelpService = {
  async getRequestsHelp(limit=8, after?: string, anchorUtc?: string, search?: string): Promise<GenericApiResponse<CursorPage<RequestHelpResponse>>> {
    const p = new URLSearchParams({ limit: String(limit) });
    if (after) p.set("after", after);
    if (anchorUtc) p.set("anchorUtc", anchorUtc);
    if (search) p.set("search", search);
    const response = await apiBaseService.execute<CursorPage<RequestHelpResponse>, undefined>({
      method: "GET",
      url: `ApiForum/SolicitudAyuda/ObtenerSolicitudesDeAyuda?${p}`,
      requireCredentials: true,
      forceLogoutIfException: false,
    });
    return response;
  },
  
  async createHelpRequest(request: CreateHelpRequest): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, CreateHelpRequest>({
      method: "POST",
      url: `ApiForum/SolicitudAyuda/CrearSolicitudAyuda`,
      requireCredentials: true,
      body: request,
    });
    return response;
  },

  async getMyHelpRequests(): Promise<GenericApiResponse<RequestHelpResponse[]>> {
    const response = await apiBaseService.execute<RequestHelpResponse[], undefined>({
      method: "GET",
      url: `ApiForum/SolicitudAyuda/ObtenerMisSolicitudesDeAyuda`,
      requireCredentials: true,
      forceLogoutIfException: false,
    });
    return response;
  },

  async getConfirmedHelpRequests(): Promise<GenericApiResponse<RequestHelpConfirmedResponse[]>> {
    return await apiBaseService.execute<RequestHelpConfirmedResponse[], undefined>({
      method: "GET",
      url: `ApiForum/SolicitudAyuda/ObtenerSolicitudesConfirmadas`,
      requireCredentials: true,
      forceLogoutIfException: false,
    });
  },

  async updateHelpRequestAvailability(id: number, request: UpdateDisponibilityRequest): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, UpdateDisponibilityRequest>({
      method: "PUT",
      url: `ApiForum/SolicitudAyuda/${id}/ActualizarHorarios`,
      requireCredentials: true,
      body: request,
    });
    return response;
  },

  async getRequestHelpDetail(id: number): Promise<GenericApiResponse<RequestHelpDetailResponse>> {
    return await apiBaseService.execute<RequestHelpDetailResponse, undefined>({
      method: "GET",
      url: `ApiForum/SolicitudAyuda/${id}/ObtenerDetalleSolicitudAyuda`,
      requireCredentials: true,
    });
  },

  async confirmHelpRequest(payload: ConfirmHelpRequestPayload): Promise<GenericApiResponse<SuccessfulResponse>> {
    return await apiBaseService.execute<SuccessfulResponse, ConfirmHelpRequestPayload>({
      method: "POST",
      url: `ApiForum/ConfirmarSolicitud`,
      body: payload,
      requireCredentials: true,
    });
  },

  async cancelHelpRequest(id: number, reason?: string): Promise<GenericApiResponse<SuccessfulResponse>> {
    return await apiBaseService.execute<SuccessfulResponse, { codeRequestHelp: number; reason?: string } | undefined>({
      method: "POST",
      url: `ApiForum/SolicitudAyuda/${id}/CancelarSolicitudAyuda`,
      body: { codeRequestHelp: id, reason },
      requireCredentials: true,
    });
  },

  async closeHelpRequest(id: number): Promise<GenericApiResponse<SuccessfulResponse>> {
    return await apiBaseService.execute<SuccessfulResponse, { codeRequestHelp: number }>({
      method: "POST",
      url: `ApiForum/SolicitudAyuda/${id}/CerrarSolicitudAyuda`,
      body: { codeRequestHelp: id },
      requireCredentials: true,
    });
  },
};
