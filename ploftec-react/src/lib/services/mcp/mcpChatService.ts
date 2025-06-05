import { apiBaseService } from "../apiBaseService";

export const mcpChatService = {
  async sendMessage(mensaje: string): Promise<string | null> {
    try {
      const response = await apiBaseService.execute<string, string>({
        method: "POST",
        url: "chatbot", // pasa por la API Gateway
        body: mensaje,
        requireCredentials: true, // si tu app usa auth
      });

      return response?.data ?? null;
    } catch (error) {
      console.error("Error en la conversación con el MCP:", error);
      return "Ocurrió un error al hablar con el asistente.";
    }
  },
};
