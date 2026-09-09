export interface WhatsAppMessagePayload {
  to: string;
  text: string;
  tenantId?: string;
}

export interface IncomingMessageData {
  from: string;
  senderName?: string;
  text: string;
  isFromMe: boolean;
}

export interface IWhatsAppService {
  sendMessage(payload: WhatsAppMessagePayload): Promise<void>;
  parseIncoming(rawPayload: any): Promise<IncomingMessageData | null>;
  setSocket(socket: any, tenantId?: string): void;
}
