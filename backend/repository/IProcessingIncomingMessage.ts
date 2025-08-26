import { WhatSendMessageDto } from "../aplicattion/dto/UserDto";

export interface IProcessingIncomingMessage {
  execute(payload: any): Promise<void | null>

}
