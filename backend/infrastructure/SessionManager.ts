import { IWhatsApiAdapterFactory } from "../repository/IWhatsApiAdapterFactory.js";
import { IWhatsApiAdapter } from "../repository/IWhatsApiAdapter";
import { BaileysApiAdapter } from "./WhatsAppApiAdapter.js";
import { createSocket } from "../bayle.js";

const sessions = new Map<string, IWhatsApiAdapter>();

export class WhatsApiAdapterFactory implements IWhatsApiAdapterFactory {
  getSession(number: string): IWhatsApiAdapter {
    if (!sessions.has(number)) {
      const adapter = new BaileysApiAdapter(number);
      sessions.set(number, adapter);
      
      createSocket(number)
    }
    return sessions.get(number)!;
  }
}
