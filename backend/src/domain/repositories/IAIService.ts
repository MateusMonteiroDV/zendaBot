export interface AIConversationContext {
  tenantId: string;
  businessName: string;
  clientPhone: string;
  clientName?: string;
  currentDate: string;
  timeZone: string;
}

export interface IAIService {
  generateReply(
    userMessage: string,
    context: AIConversationContext
  ): Promise<string>;
}
