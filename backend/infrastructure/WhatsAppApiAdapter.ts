import 'dotenv/config';


import { WhatSendMessageDto } from "../aplicattion/dto/UserDto";
import { IWhatsApiAdapter } from "../repository/IWhatsApiAdapter";
import axios from "axios";


console.log(process.env.WHAT_TOKEN)
export class WhatsApiAdapter implements IWhatsApiAdapter {
  private token: string
  private phoneNumberId: string


  constructor() {
    this.token = process.env.WHAT_TOKEN!,
      this.phoneNumberId = process.env.WHAT_ID_PHONE_NUMBER!

  }

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

  async handleIncoming(payload: any) {
    const message = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return null;

    return {
      to: message.from,
      text: message.text?.body,
    };
  }
}

