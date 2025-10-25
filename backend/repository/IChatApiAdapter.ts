import { ChatMessageDto } from "../aplicattion/dto/UserDto";

export interface IChatApiAdapter {
  reply(message: string | null): Promise<string | null>;
}
