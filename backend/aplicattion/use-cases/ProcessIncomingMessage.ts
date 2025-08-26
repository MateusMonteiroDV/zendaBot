import { IProcessingIncomingMessage } from '../../repository/IProcessingIncomingMessage'
import { IWhatsApiAdapter } from '../../repository/IWhatsApiAdapter'
import { IChatApiAdapter } from '../../repository/IChatApiAdapter'
import { WhatSendMessageDto } from '../dto/UserDto'

export class ProcessingIncomingMessage implements IProcessingIncomingMessage {

  constructor(
    private chatApiAdapter: IChatApiAdapter,
    private whatApiAdapter: IWhatsApiAdapter
  ) { }

  async execute(payload: any) {

    try {
      const what: WhatSendMessageDto | null = await this.whatApiAdapter.handleIncoming(payload)
      if (!what) {
        return null
      }
      const reply: string | null = await this.chatApiAdapter.reply({ message: what.text });
      if (!reply) {
        return null
      }
      await this.whatApiAdapter.send({
        to: what.to,
        text: reply
      })
    } catch (e) {
      console.log(e)
      return null
    }

  }







}
