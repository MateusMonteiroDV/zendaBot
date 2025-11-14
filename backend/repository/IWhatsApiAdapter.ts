import { WhatSendMessageDto } from "../aplicattion/dto/UserDto.js";

export interface IWhatsApiAdapter {
  handleIncoming(payload: any): Promise<WhatSendMessageDto | null>;
  sendMessage(to: string, text: string): Promise<void>;
}

