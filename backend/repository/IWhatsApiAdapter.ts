import { WhatSendMessageDto } from '../aplicattion/dto/UserDto.js'


export interface IWhatsApiAdapter {
  send(payload: WhatSendMessageDto): Promise<void>;
  handleIncoming(payload: any): Promise<WhatSendMessageDto | null>


}
