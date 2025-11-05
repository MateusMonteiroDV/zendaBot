import makeWASocket, { useMultiFileAuthState, WASocket } from "@whiskeysockets/baileys";
import { WhatSendMessageDto } from "../aplicattion/dto/UserDto.js";
import { IWhatsApiAdapter } from "../repository/IWhatsApiAdapter.js";
import {createSocket} from "../bayle.js"
export class BaileysApiAdapter implements IWhatsApiAdapter {
  private sock: WASocket | null = null;

  constructor(private number: string) {
    this.initialize();
  }

  private async initialize() {
    await createSocket(this.number)
  }

  setSocket(sock: any) {
    this.sock = sock;
  }

  async handleIncoming(payload: any): Promise<WhatSendMessageDto | null> {
    const text = payload?.message?.conversation;
    const to = payload?.key?.remoteJid;
    if (!text || !to) return null;
    return { to, text };
  }

  async sendMessage(to: string, text: string) {
    if (!this.sock) throw new Error("Socket not initialized");
    await this.sock.sendMessage(to, { text });
  }
}

