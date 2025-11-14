import { WhatSendMessageDto } from "../aplicattion/dto/UserDto.js";
import { IWhatsApiAdapter } from "../repository/IWhatsApiAdapter.js";
import { createSocket } from "../bayle.js";
import type { WASocket } from "@whiskeysockets/baileys";

export class BaileysApiAdapter implements IWhatsApiAdapter {
  private sock: WASocket | null = null;

  constructor(private number: string) {
    this.initialize();
  }

  private async initialize() {
    this.sock = await createSocket(this.number);
    await new Promise<void>((resolve) => {
      this.sock?.ev.on("connection.update", (update) => {
        if (update.connection === "open") resolve();
      });
    });
  }

  async handleIncoming(payload: any): Promise<WhatSendMessageDto | null> {
    const text = payload?.message?.conversation;
    const to = payload?.key?.remoteJid;
    if (!text || !to) return null;
    return { to, text };
  }

  async sendMessage(to: string, text: string) {
    if (!this.sock) throw new Error("Socket not initialized");
    if (to === this.number + "@s.whatsapp.net") {
      await this.sock.presenceSubscribe(to);
    }
    await this.sock.sendMessage(to, { text });
  }
}


