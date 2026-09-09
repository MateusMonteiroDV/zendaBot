import { ILlmProvider, LlmChatOptions, LlmOutput, LlmToolCall } from "./ILlmProvider.js";

export class ClaudeLlmProvider implements ILlmProvider {
  public readonly providerName = "claude";
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model: string = "claude-3-5-sonnet-20241022") {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || "";
    this.model = model;
  }

  async chat(options: LlmChatOptions): Promise<LlmOutput> {
    const messages = options.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

    if (messages.length === 0) {
      messages.push({ role: "user", content: "Olá" });
    }

    const tools = options.tools?.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters,
    }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        system: options.systemPrompt,
        messages,
        tools: tools && tools.length > 0 ? tools : undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error (${response.status}): ${errorText}`);
    }

    const data: any = await response.json();
    let text = "";
    const toolCalls: LlmToolCall[] = [];

    for (const block of data.content || []) {
      if (block.type === "text") {
        text += block.text;
      } else if (block.type === "tool_use") {
        toolCalls.push({
          id: block.id,
          name: block.name,
          arguments: block.input || {},
        });
      }
    }

    return {
      text: text || undefined,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };
  }
}
