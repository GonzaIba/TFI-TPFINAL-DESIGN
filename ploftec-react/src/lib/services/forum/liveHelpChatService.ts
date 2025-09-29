import { apiBaseService } from "../apiBaseService";
import type { ChatMessageResponse, SendChatMessageRequest, MarkChatReadRequest, ChatUnreadCountResponse } from "@/lib/types/forum";

export const liveHelpChatService = {
  async getChatMessages(requestId: number, afterUtc?: string, take: number = 50, asc: boolean = false) {
    const p: string[] = [];
    if (afterUtc) p.push(`afterUtc=${encodeURIComponent(afterUtc)}`);
    if (take) p.push(`take=${take}`);
    if (asc) p.push(`asc=${asc}`);
    const qs = p.length ? `?${p.join("&")}` : "";
    return await apiBaseService.execute<ChatMessageResponse[], undefined>({
      method: "GET",
      url: `ApiForum/SolicitudAyuda/${requestId}/Chat/Mensajes${qs}`,
      requireCredentials: true,
    });
  },

  async sendChatMessage(requestId: number, body: SendChatMessageRequest) {
    return await apiBaseService.execute<any, SendChatMessageRequest>({
      method: "POST",
      url: `ApiForum/SolicitudAyuda/${requestId}/Chat/Mensajes`,
      body,
      requireCredentials: true,
    });
  },

  async markChatAsRead(requestId: number, body: MarkChatReadRequest = {}) {
    return await apiBaseService.execute<{ success: boolean }, MarkChatReadRequest>({
      method: "POST",
      url: `ApiForum/SolicitudAyuda/${requestId}/Chat/Leido`,
      body,
      requireCredentials: true,
    });
  },

  async getUnreadCount(requestId: number) {
    // El gateway resuelve userId internamente por cookie; no mandamos query userId.
    return await apiBaseService.execute<ChatUnreadCountResponse, undefined>({
      method: "GET",
      url: `ApiForum/SolicitudAyuda/${requestId}/Chat/NoLeido`,
      requireCredentials: true,
    });
  },
};
