import { apiBaseService } from "../apiBaseService";
import type {
  ChatMessageResponse,
  SendChatMessageRequest,
  MarkChatReadRequest,
  ChatUnreadCountResponse,
  HelpRequestChatDetailResponse,
  HelpRequestChatsResponse,
} from "@/lib/types/forum";

export const liveHelpChatService = {
  async listMyRequestChats(requestId: number) {
    return await apiBaseService.execute<HelpRequestChatsResponse[], undefined>({
      method: "GET",
      url: `ApiForum/SolicitudAyuda/${requestId}/ObtenerChatsDeMiSolicitud`,
      requireCredentials: true,
    });
  },

  async getChatDetail(requestId: number, chatId: number) {
    const p = new URLSearchParams();
    if (typeof chatId === "number") p.set("chatId", String(chatId));
    const qs = p.toString() ? `?${p}` : "";
    return await apiBaseService.execute<HelpRequestChatDetailResponse, undefined>({
      method: "GET",
      url: `ApiForum/SolicitudAyuda/${requestId}/Chat/Mensajes${qs}`,
      requireCredentials: true,
    });
  },

  async createChat(requestId: number) {
    // Puede devolver { codeChat } o un número según gateway; manejamos ambos
    return await apiBaseService.execute<{ codeChat?: number } | number, undefined>({
      method: "POST",
      url: `ApiForum/SolicitudAyuda/${requestId}/Chat/Crear`,
      requireCredentials: true,
    });
  },

  async sendChatMessage(requestId: number, body: SendChatMessageRequest) {
    return await apiBaseService.execute<ChatMessageResponse, SendChatMessageRequest>({
      method: "POST",
      url: `ApiForum/SolicitudAyuda/${requestId}/Chat/EnviarMensaje`,
      body,
      requireCredentials: true,
    });
  },

  async markChatAsRead(requestId: number, body: MarkChatReadRequest) {
    return await apiBaseService.execute<{ success: boolean }, MarkChatReadRequest>({
      method: "POST",
      url: `ApiForum/SolicitudAyuda/${requestId}/Chat/Leido`,
      body,
      requireCredentials: true,
    });
  },

  async getUnreadCount(requestId: number, codeChat: number) {
    // Gateway resuelve userId por cookie; enviamos solo codeChat.
    return await apiBaseService.execute<ChatUnreadCountResponse, undefined>({
      method: "GET",
      url: `ApiForum/SolicitudAyuda/${requestId}/Chat/NoLeido?codeChat=${encodeURIComponent(
        String(codeChat)
      )}`,
      requireCredentials: true,
    });
  },
};
