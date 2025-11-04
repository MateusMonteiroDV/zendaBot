import { IWhatsApiAdapter } from "./IWhatsApiAdapter";

export interface IWhatsApiAdapterFactory {
  getSession(number: string): IWhatsApiAdapter;
}
