import { ChatMessageDto } from "../aplicattion/dto/UserDto";

export interface IChatApiAdapter {
  reply(message: ChatMessageDto): Promise<string | null>
}
