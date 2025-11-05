import { IWhatsApiAdapterFactory } from "../../repository/IWhatsApiAdapterFactory.js";
import { IChatApiAdapter } from "../../repository/IChatApiAdapter.js";
import { WhatSendMessageDto } from "../dto/UserDto";
import {IProcessingincomingmessage} from "../../repository/IProcessingIncomingMessage.js"

export class ProcessingIncomingMessage implements IProcessingincomingmessage{
  constructor(
    private chatApiAdapter: IChatApiAdapter,
    private whatApiFactory: IWhatsApiAdapterFactory,
  ) {}

  async execute(payload: any, number: string) {
    const whatApiAdapter = this.whatApiFactory.getSession(number);

    const what: WhatSendMessageDto | null = await whatApiAdapter.handleIncoming(payload);
    if (!what) throw new Error("Invalid message");

    const reply = await this.chatApiAdapter.reply(what.text);
    if (!reply) throw new Error("Chat service returned no reply");
    //@ts-ignore
    await whatApiAdapter.sendMessage(what.to, reply);
  }
}

