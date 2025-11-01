// src/lib/services/publicacionesService.ts
import { CursorPage, GenericApiResponse } from "@/lib/types/apiResponse";
import { apiBaseService } from "../apiBaseService";
import {
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
  TermsConditionsResponse,
  LiveHelpSessionResponse,
  CancelHelpRequestPayload,
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

  async confirmHelpRequest(id: number, payload: ConfirmHelpRequestPayload): Promise<GenericApiResponse<SuccessfulResponse>> {
    return await apiBaseService.execute<SuccessfulResponse, ConfirmHelpRequestPayload>({
      method: "POST",
      url: `ApiForum/SolicitudAyuda/${id}/ConfirmarSolicitud`,
      body: payload,
      requireCredentials: true,
    });
  },

  async cancelConfirmedHelpRequest(id: number): Promise<GenericApiResponse<SuccessfulResponse>> {
    return await apiBaseService.execute<SuccessfulResponse, undefined>({
      method: "DELETE",
      url: `ApiForum/SolicitudAyuda/${id}/CancelarConfirmacion`,
      requireCredentials: true,
      handleError: true
    });
  },

  async getTermsConditions(): Promise<GenericApiResponse<TermsConditionsResponse>> {
    return await apiBaseService.execute<TermsConditionsResponse, undefined>({
      method: "GET",
      url: `ApiForum/ObtenerTerminosCondiciones`,
      requireCredentials: true,
      forceLogoutIfException: false,
    });
  },

  async acceptTermsConditions(codeRequestHelp: number): Promise<GenericApiResponse<SuccessfulResponse>> {
    const query = new URLSearchParams({ codeRequestHelp: String(codeRequestHelp) }).toString();
    return await apiBaseService.execute<SuccessfulResponse, undefined>({
      method: "POST",
      url: `ApiForum/AceptarTerminosCondiciones?${query}`,
      requireCredentials: true,
      forceLogoutIfException: false,
    });
  },

  async getLiveHelpSession(codeRequestHelp: number): Promise<GenericApiResponse<LiveHelpSessionResponse>> {
    const query = new URLSearchParams({ codeRequestHelp: String(codeRequestHelp) }).toString();
    return await apiBaseService.execute<LiveHelpSessionResponse, undefined>({
      method: "GET",
      url: `ApiForum/ObtenerSesion?${query}`,
      requireCredentials: true,
      forceLogoutIfException: false,
    });
  },

  async enterLiveHelpSession(request: { codeSession: string; userId?: string }): Promise<GenericApiResponse<LiveHelpSessionResponse>> {
    return await apiBaseService.execute<LiveHelpSessionResponse, { codeSession: string; userId?: string }>({
      method: "POST",
      url: `ApiForum/IngresarSesion`,
      requireCredentials: true,
      forceLogoutIfException: false,
      body: request,
    });
  },

  async cancelHelpRequest(id: number): Promise<GenericApiResponse<SuccessfulResponse>> {
    return await apiBaseService.execute<SuccessfulResponse, CancelHelpRequestPayload>({
      method: "DELETE",
      url: `ApiForum/SolicitudAyuda/${id}/CancelarSolicitudAyuda`,
      requireCredentials: true,
      body: {},
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
