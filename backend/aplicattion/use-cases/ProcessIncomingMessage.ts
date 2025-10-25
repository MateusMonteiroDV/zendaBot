import { IProcessingIncomingMessage } from "../../repository/IProcessingIncomingMessage";
import { IWhatsApiAdapter } from "../../repository/IWhatsApiAdapter";
import { IChatApiAdapter } from "../../repository/IChatApiAdapter";
import { WhatSendMessageDto } from "../dto/UserDto";

export class ProcessingIncomingMessage implements IProcessingIncomingMessage {
  constructor(
    private chatApiAdapter: IChatApiAdapter,
    private whatApiAdapter: IWhatsApiAdapter,
  ) {}
  setSocket(sock: any) {
    if ("setSocket" in this.whatApiAdapter) {
      (this.whatApiAdapter as any).setSocket(sock);
    }
  }
  async execute(payload: any) {
    const what: WhatSendMessageDto | null =
      await this.whatApiAdapter.handleIncoming(payload);

    if (!what) {
      throw new Error("Something goes wrong with message");
    }
    const reply: string | null = await this.chatApiAdapter.reply({
      message: what.text,
    });
    if (!reply) {
      throw new Error(undefined);
    }
    await this.whatApiAdapter.send({
      to: what.to,
      text: reply,
    });

    return null;
  }
}
