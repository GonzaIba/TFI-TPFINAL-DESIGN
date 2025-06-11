// src/lib/services/publicacionesService.ts
import { GenericApiResponse } from "@/lib/types/apiResponse";
import { apiBaseService } from "../apiBaseService";
import {
  AnswerVoteRequest,
  PublicationDetailResponse,
  PublicationResponse,
  PublicationVoteRequest,
  SuccessfulResponse,
  AnswerPublicationVoteResponse,
  AddAnswerRequest,
  AnswerResponse
} from "@/lib/types/forum";

export const publicationsService = {
  async getPublications(): Promise<GenericApiResponse<PublicationResponse[]>> {
    const response = await apiBaseService.execute<PublicationResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerPublicaciones",
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

  async getCreatedPublications(): Promise<GenericApiResponse<PublicationResponse[]>> {
    const response = await apiBaseService.execute<PublicationResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerPublicacionesCreadasPorUsuario",
      requireCredentials: true,
    });
    return response;
  },

  async getSavedPublications(): Promise<GenericApiResponse<PublicationResponse[]>> {
    const response = await apiBaseService.execute<PublicationResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerPublicacionesGuardadas",
      requireCredentials: true,
      forceLogoutIfException: true,
    });
    return response;
  },

  async getPublicationsWithFilter(texto: string): Promise<GenericApiResponse<PublicationResponse[]>> {
    const response = await apiBaseService.execute<PublicationResponse[], undefined>({
      method: "GET",
      url: `ApiForum/BuscarPublicacionesConFiltro?texto=${texto}`,
      requireCredentials: false,
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
};