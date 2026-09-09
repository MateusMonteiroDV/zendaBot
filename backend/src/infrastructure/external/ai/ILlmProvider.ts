export interface LlmMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  toolCallId?: string;
}

export interface LlmToolProperty {
  type: string;
  description?: string;
  enum?: string[];
}

export interface LlmToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, LlmToolProperty>;
    required?: string[];
  };
}

export interface LlmToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface LlmOutput {
  text?: string;
  toolCalls?: LlmToolCall[];
}

export interface LlmChatOptions {
  systemPrompt?: string;
  messages: LlmMessage[];
  tools?: LlmToolDefinition[];
}

export interface ILlmProvider {
  readonly providerName: string;
  chat(options: LlmChatOptions): Promise<LlmOutput>;
}
