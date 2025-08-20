import { IChatApiAdapter } from '../repository/IChatApiAdapter'
import { ChatMessageDto } from '../aplicattion/dto/UserDto.js'
import Groq from 'groq-sdk'

export class ChatApiAdapter implements IChatApiAdapter {
  constructor(private grogApiService: Groq) { }


  async reply(message: ChatMessageDto) {
    const response = await this.grogApiService.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Explain the importance of fast language models",
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const text: string | null = response.choices[0].message.content
    return text
  }
}
