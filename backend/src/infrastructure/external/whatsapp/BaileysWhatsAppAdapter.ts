import {
  IWhatsAppService,
  WhatsAppMessagePayload,
  IncomingMessageData,
} from "../../../domain/repositories/IWhatsAppService.js";
import { AppError } from "../../../domain/errors/AppError.js";

export class BaileysWhatsAppAdapter implements IWhatsAppService {
  private sockets: Map<string, any> = new Map();
  private defaultSocket: any = null;

  setSocket(socket: any, tenantId?: string): void {
    if (tenantId) {
      this.sockets.set(tenantId, socket);
    }
    this.defaultSocket = socket;
  }

  removeSocket(tenantId: string): void {
    this.sockets.delete(tenantId);
    if (this.defaultSocket === this.sockets.get(tenantId)) {
      this.defaultSocket = this.sockets.values().next().value || null;
    }
  }

  async sendMessage(payload: WhatsAppMessagePayload): Promise<void> {
    const sock = (payload.tenantId && this.sockets.get(payload.tenantId)) || this.defaultSocket;
    if (!sock) {
      throw new AppError(
        payload.tenantId
          ? `WhatsApp socket não foi inicializado para o Tenant ${payload.tenantId}`
          : "WhatsApp socket não foi inicializado",
        503
      );
    }
    await sock.sendMessage(payload.to, { text: payload.text });
  }

  async parseIncoming(rawPayload: any): Promise<IncomingMessageData | null> {
    if (!rawPayload) return null;

    const message =
      rawPayload.message?.conversation ||
      rawPayload.message?.extendedTextMessage?.text;

    if (!message) return null;

    const from = rawPayload.key?.participant || rawPayload.key?.remoteJid || "";
    const isFromMe = Boolean(rawPayload.key?.fromMe);
    const senderName = rawPayload.pushName || rawPayload.key?.pushName || undefined;

    return {
      from,
      senderName,
      text: message,
      isFromMe,
    };
  }
}
