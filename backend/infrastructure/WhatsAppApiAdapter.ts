import { IWhatsApiAdapter } from '../repository/IWhatsApiAdapter'

export class WhatsApiAdapter implements IWhatsApiAdapter {
  constructor(private whatApiService: any) { }
  async send() { }

}
