// src/lib/services/publicacionesService.ts
import { GenericApiResponse, PaginatedList } from "@/lib/types/apiResponse";
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
  DeletePublicationRequest,
  ReportPublicationRequest,
  ReportAnswerRequest,
} from "@/lib/types/forum";

export const publicationsService = {
  async createPublication(request : CreatePublicationRequest): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, CreatePublicationRequest>({
      method: "POST",
      url: "ApiForum/CrearPublicacion",
      requireCredentials: true,
      body: request
    });
    return response;
  },

  async getPublications(pageIndex: number,pageCount: number)
  : Promise<GenericApiResponse<PaginatedList<PublicationResponse>>> {
      const response = await apiBaseService.execute<
        PaginatedList<PublicationResponse>,
        undefined
      >({
        method: "GET",
        url: `ApiForum/ObtenerPublicaciones?pageIndex=${pageIndex}&pageCount=${pageCount}`,
        requireCredentials: true,
      });
      return response;
    },

  async getDetailPublication(code: number): Promise<GenericApiResponse<PublicationDetailResponse>> {
    const response = await apiBaseService.execute<PublicationDetailResponse, undefined>({
      method: "GET",
      url: `ApiForum/ObtenerDetallePublicacion?codePublication=${code}`,
      requireCredentials: true,
    });
    return response;
  },

  async getRelatedPublications(code: number): Promise<GenericApiResponse<PublicationResponse[]>> {
    const response = await apiBaseService.execute<PublicationResponse[], undefined>({
      method: "GET",
      url: `ApiForum/ObtenerPublicacionesRelacionadas?codePublication=${code}`,
      requireCredentials: true,
    });
    return response;
  },

  async getCreatedPublications(pageIndex: number, pageCount: number)
  : Promise<GenericApiResponse<PaginatedList<PublicationResponse>>> {
    const response = await apiBaseService.execute<PaginatedList<PublicationResponse>, undefined>({
      method: "GET",
      url: `ApiForum/ObtenerPublicacionesCreadasPorUsuario?pageIndex=${pageIndex}&pageCount=${pageCount}`,
      requireCredentials: true,
    });
    return response;
  },

  async getSavedPublications(pageIndex: number, pageCount: number)
  : Promise<GenericApiResponse<PaginatedList<PublicationResponse>>> {
    const response = await apiBaseService.execute<PaginatedList<PublicationResponse>, undefined>({
      method: "GET",
      url: `ApiForum/ObtenerPublicacionesGuardadas?pageIndex=${pageIndex}&pageCount=${pageCount}`,
      requireCredentials: true,
      forceLogoutIfException: true,
    });
    return response;
  },

  async getPublicationsWithFilter(rawQuery: string, pageIndex: number, pageCount: number)
  : Promise<GenericApiResponse<PaginatedList<PublicationResponse>>>{
    const response = await apiBaseService.execute<PaginatedList<PublicationResponse>, undefined>({
      method: "GET",
      url: `ApiForum/BuscarPublicaciones?rawQuery=${rawQuery}&pageIndex=${pageIndex}&pageCount=${pageCount}`,
      requireCredentials: false,
    });
    return response;
  },

  async getTopPublicationsLastWeek(): Promise<GenericApiResponse<PublicationResponse[]>> {
    const response = await apiBaseService.execute<PublicationResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerTopPublicacionesSemana",
      requireCredentials: true,
    });
    return response;
  },

  async savePublication(code: number): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, undefined>({
      method: "POST",
      url: `ApiForum/GuardarPublicacion?publicationCode=${code}`,
      requireCredentials: true,
    });
    return response;
  },

  async deleteSavedPublication(code: number): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, undefined>({
      method: "DELETE",
      url: `ApiForum/EliminarPublicacionGuardada?publicationCode=${code}`,
      requireCredentials: true,
    });
    return response;
  },

  async votePublication(request: PublicationVoteRequest): Promise<GenericApiResponse<AnswerPublicationVoteResponse>> {
    const response = await apiBaseService.execute<AnswerPublicationVoteResponse, PublicationVoteRequest>({
      method: "POST",
      url: `ApiForum/VotarPublicacion`,
      requireCredentials: true,
      body: request,
    });
    return response;
  },

  async voteAnswer(request: AnswerVoteRequest): Promise<GenericApiResponse<AnswerPublicationVoteResponse>> {
    const response = await apiBaseService.execute<AnswerPublicationVoteResponse, AnswerVoteRequest>({
      method: "POST",
      url: `ApiForum/VotarRespuesta`,
      requireCredentials: true,
      body: request,
    });
    return response;
  },

  async addAnswer(request: AddAnswerRequest): Promise<GenericApiResponse<AnswerResponse>> {
    const response = await apiBaseService.execute<AnswerResponse, AddAnswerRequest>({
      method: "POST",
      url: `ApiForum/AgregarRespuesta`,
      requireCredentials: true,
      body: request,
    });
    return response;
  },

  async deleteMyAnswer(request: DeleteAnswerRequest): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, DeleteAnswerRequest>({
      method: "DELETE",
      url: `ApiForum/EliminarRespuestaPropia`,
      requireCredentials: true,
      body: request,
      handleError: true
    });
    return response;
  },

  async editAnswer(request: EditAnswerRequest): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, EditAnswerRequest>({
      method: "PUT",
      url: `ApiForum/EditarRespuesta`,
      requireCredentials: true,
      body: request,
    });
    return response;
  },

  async predictLabels(request: string): Promise<GenericApiResponse<string[]>> {
    const response = await apiBaseService.execute<string[], undefined>({
      method: "GET",
      url: `ApiForum/PredecirEtiquetas?texto=${request}`,
      requireCredentials: true,
    });
    return response;
  },

  async deletePublication(request: DeletePublicationRequest): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, DeletePublicationRequest>({
      method: "POST",
      url: "ApiForum/EliminarPublicacion",
      requireCredentials: true,
      body: request,
    });
    return response;
  },

  async reportPublication(request: ReportPublicationRequest): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, ReportPublicationRequest>({
      method: "POST",
      url: "ApiForum/DenunciarPublicacion",
      requireCredentials: true,
      body: request,
      handleError: true,
    });
    return response;
  },

  async reportAnswer(request: ReportAnswerRequest): Promise<GenericApiResponse<SuccessfulResponse>> {
    const response = await apiBaseService.execute<SuccessfulResponse, ReportAnswerRequest>({
      method: "POST",
      url: "ApiForum/DenunciarRespuesta",
      requireCredentials: true,
      body: request,
      handleError: true,
    });
    return response;
  },
};
