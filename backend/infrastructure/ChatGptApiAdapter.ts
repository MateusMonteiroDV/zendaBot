import { IChatApiAdapter } from "../repository/IChatApiAdapter";
import { ChatMessageDto } from "../aplicattion/dto/UserDto.js";
import Groq from "groq-sdk";

export class ChatApiAdapter implements IChatApiAdapter {
  constructor(private grogApiService: Groq) {}

  async reply(message: string) {
    const response = await this.grogApiService.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "Você está conversando no WhatsApp. Responda como uma pessoa normal, de forma natural e descontraída, falando sobre qualquer assunto que a outra pessoa mencionar.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });
    const text = response.choices[0].message.content;
    return text;
  }
}
