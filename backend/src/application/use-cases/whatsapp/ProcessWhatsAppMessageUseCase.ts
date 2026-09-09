import { IWhatsAppService } from "../../../domain/repositories/IWhatsAppService.js";
import { IAIService, AIConversationContext } from "../../../domain/repositories/IAIService.js";
import { ITenantRepository } from "../../../domain/repositories/ITenantRepository.js";

export interface ProcessMessageContext {
  tenantId?: string;
  senderName?: string;
}

export class ProcessWhatsAppMessageUseCase {
  constructor(
    private whatsAppService: IWhatsAppService,
    private aiService: IAIService,
    private tenantRepository: ITenantRepository
  ) {}

  async execute(rawPayload: any, context?: ProcessMessageContext): Promise<string | null> {
    const parsed = await this.whatsAppService.parseIncoming(rawPayload);
    if (!parsed || parsed.isFromMe || !parsed.text.trim()) {
      return null;
    }

    const tenantId = context?.tenantId || rawPayload?.tenantId || "default_tenant";
    const tenant = await this.tenantRepository.findById(tenantId);
    const businessName = tenant?.businessName || "Atendimento";
    const timeZone = tenant?.calendarConfig?.timeZone || "America/Sao_Paulo";
    const clientPhone = parsed.from.replace(/@.*$/, "");
    const clientName = context?.senderName || parsed.senderName || "Cliente";

    const aiContext: AIConversationContext = {
      tenantId,
      businessName,
      clientPhone,
      clientName,
      currentDate: new Date().toISOString().split("T")[0],
      timeZone,
    };

    const reply = await this.aiService.generateReply(parsed.text, aiContext);
    if (!reply) return null;

    try {
      await this.whatsAppService.sendMessage({
        to: parsed.from,
        text: reply,
        tenantId,
      });
    } catch (err: any) {
      console.warn(`[ProcessWhatsAppMessageUseCase] Socket message delivery warning: ${err.message}`);
    }

    return reply;
  }
}
