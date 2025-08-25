
import { WhatSendMessageDto } from "../aplicattion/dto/UserDto";
import { IWhatsApiAdapter } from "../repository/IWhatsApiAdapter";
import axios from "axios";

export class WhatsApiAdapter implements IWhatsApiAdapter {
  constructor(
    private token: string,
    private phoneNumberId: string
  ) { }

  async send(payload: WhatSendMessageDto) {
    const url = `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`;

    await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: payload.to,
        type: "text",
        text: { body: payload.text },
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      }
    );
  }

  async handleIncoming() {
    const message = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return null;

    return {
      from: message.from,
      text: message.text?.body,
    };
  }
}

