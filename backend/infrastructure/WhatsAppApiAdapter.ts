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
    const message = payload.message?.conversation;
    if (!message) return null;

    return {
      to: payload.key.remoteJid,
      text: message,
    };
  }
}
