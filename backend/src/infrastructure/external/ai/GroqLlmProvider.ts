import Groq from "groq-sdk";
import { ILlmProvider, LlmChatOptions, LlmOutput, LlmToolCall } from "./ILlmProvider.js";

export class GroqLlmProvider implements ILlmProvider {
  public readonly providerName = "groq";
  private client: Groq;
  private model: string;

  constructor(apiKeyOrClient?: any, model: string = "llama-3.3-70b-versatile") {
    if (apiKeyOrClient && typeof apiKeyOrClient === "object" && apiKeyOrClient.chat) {
      this.client = apiKeyOrClient;
    } else if (typeof apiKeyOrClient === "string") {
      this.client = new Groq({ apiKey: apiKeyOrClient });
    } else {
      const key = process.env.GROQ_API_KEY || "dummy_key";
      this.client = new Groq({ apiKey: key });
    }
    this.model = model;
  }

  async chat(options: LlmChatOptions): Promise<LlmOutput> {
    const messages: any[] = [];
    if (options.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }

    for (const m of options.messages) {
      const msgObj: any = {
        role: m.role,
        content: m.content,
      };
      if (m.toolCallId) msgObj.tool_call_id = m.toolCallId;
      if (m.name) msgObj.name = m.name;
      messages.push(msgObj);
    }

    const tools = options.tools?.map((t) => ({
      type: "function" as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages,
      tools: tools && tools.length > 0 ? tools : undefined,
      tool_choice: tools && tools.length > 0 ? "auto" : undefined,
    });

    const choice = completion.choices[0]?.message;
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
