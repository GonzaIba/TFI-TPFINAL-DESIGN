// src/lib/services/publicacionesService.ts
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
  async getPublications(): Promise<PublicationResponse[]> {
    const response = await apiBaseService.execute<PublicationResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerPublicaciones",
      requireCredentials: true,
    });
    return response.data ?? [];
  },

  async getDetailPublication(code: number): Promise<PublicationDetailResponse> {
    const response = await apiBaseService.execute<PublicationDetailResponse, undefined>({
      method: "GET",
      url: `ApiForum/ObtenerDetallePublicacion?codePublication=${code}`,
      requireCredentials: true,
    });
    return response?.data ?? {};
  },

  async getCreatedPublications(): Promise<PublicationResponse[]> {
    const response = await apiBaseService.execute<PublicationResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerPublicacionesCreadasPorUsuario",
      requireCredentials: true,
    });
    return response.data ?? [];
  },

  async getSavedPublications(): Promise<PublicationResponse[]> {
    const response = await apiBaseService.execute<PublicationResponse[], undefined>({
      method: "GET",
      url: "ApiForum/ObtenerPublicacionesGuardadas",
      requireCredentials: true,
      forceLogoutIfException: true,
    });
    return response.data ?? [];
  },

  async getPublicationsWithFilter(texto: string): Promise<PublicationResponse[]> {
    const response = await apiBaseService.execute<PublicationResponse[], undefined>({
      method: "GET",
      url: `ApiForum/BuscarPublicacionesConFiltro?texto=${texto}`,
      requireCredentials: false,
    });
    return response.data ?? [];
  },

  async savePublication(code: number): Promise<boolean> {
    const response = await apiBaseService.execute<SuccessfulResponse, undefined>({
      method: "POST",
      url: `ApiForum/GuardarPublicacion?publicationCode=${code}`,
      requireCredentials: true,
    });
    return response.data?.success ?? false;
  },

  async deleteSavedPublication(code: number): Promise<boolean> {
    const response = await apiBaseService.execute<SuccessfulResponse, undefined>({
      method: "DELETE",
      url: `ApiForum/EliminarPublicacionGuardada?publicationCode=${code}`,
      requireCredentials: true,
    });
    return response.data?.success ?? false;
  },

  async votePublication(request: PublicationVoteRequest): Promise<AnswerPublicationVoteResponse> {
    const response = await apiBaseService.execute<AnswerPublicationVoteResponse, PublicationVoteRequest>({
      method: "POST",
      url: `ApiForum/VotarPublicacion`,
      requireCredentials: true,
      body: request,
    });
    return response.data;
  },

  async voteAnswer(request: AnswerVoteRequest): Promise<AnswerPublicationVoteResponse> {
    const response = await apiBaseService.execute<AnswerPublicationVoteResponse, AnswerVoteRequest>({
      method: "POST",
      url: `ApiForum/VotarRespuesta`,
      requireCredentials: true,
      body: request,
    });
    return response.data;
  },

  async addAnswer(request: AddAnswerRequest): Promise<AnswerResponse> {
    const response = await apiBaseService.execute<AnswerResponse, AddAnswerRequest>({
      method: "POST",
      url: `ApiForum/AgregarRespuesta`,
      requireCredentials: true,
      body: request,
    });
    return response.data;
  },
};