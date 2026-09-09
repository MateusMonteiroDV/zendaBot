import { ILlmProvider, LlmChatOptions, LlmOutput, LlmToolCall } from "./ILlmProvider.js";

export class OpenAILlmProvider implements ILlmProvider {
  public readonly providerName = "openai";
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model: string = "gpt-4o-mini") {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || "";
    this.model = model;
  }

  async chat(options: LlmChatOptions): Promise<LlmOutput> {
    const messages: any[] = [];
    if (options.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }

    for (const m of options.messages) {
      const msg: any = { role: m.role, content: m.content };
      if (m.toolCallId) msg.tool_call_id = m.toolCallId;
      if (m.name) msg.name = m.name;
      messages.push(msg);
    }

    const tools = options.tools?.map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        tools: tools && tools.length > 0 ? tools : undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data: any = await response.json();
    const choice = data.choices?.[0]?.message;
    const toolCalls: LlmToolCall[] = [];

    if (choice?.tool_calls && choice.tool_calls.length > 0) {
      for (const tc of choice.tool_calls) {
        let args = {};
        try {
          args = JSON.parse(tc.function.arguments);
        } catch {}
        toolCalls.push({
          id: tc.id,
          name: tc.function.name,
          arguments: args,
        });
      }
    }

    return {
      text: choice?.content || undefined,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };
  }
}
