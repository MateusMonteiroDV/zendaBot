import { WhatSendMessageDto } from "../aplicattion/dto/UserDto";

export interface IProcessingincomingmessage {
  execute(payload: any, number: string): Promise<void | null>;
}

