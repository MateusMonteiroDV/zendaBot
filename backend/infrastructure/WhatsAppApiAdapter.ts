import { WhatSendMessageDto } from "../aplicattion/dto/UserDto";
import { IWhatsApiAdapter } from "../repository/IWhatsApiAdapter";

export class BaileysApiAdapter implements IWhatsApiAdapter {
  private sock: any | null = null;

  setSocket(sock: any) {
    this.sock = sock;
  }

  async send(payload: WhatSendMessageDto) {
    if (!this.sock) throw new Error("Socket not initialized");
    await this.sock.sendMessage(payload.to, { text: payload.text });
  }

  async handleIncoming(payload: any) {
    const message =
      payload.message?.conversation ||
      payload.message?.extendedTextMessage?.text;
    if (!message) return null;
    if (payload.key.fromMe) return null
    const from = payload.key.participant || payload.key.remoteJid;
    return {
      to: from,
      text: message,
    };
  }
}
