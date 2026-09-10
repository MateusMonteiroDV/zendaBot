import { GoogleGenAI } from "@google/genai";
import { ILlmProvider, LlmChatOptions, LlmOutput, LlmToolCall } from "./ILlmProvider.js";

export class GeminiLlmProvider implements ILlmProvider {
  public readonly providerName = "gemini";
  private client: GoogleGenAI;
  private model: string;

  constructor(apiKey?: string, model: string = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite") {
    const key = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "dummy_key";
    this.client = new GoogleGenAI({ apiKey: key });
    this.model = model;
  }

  async chat(options: LlmChatOptions): Promise<LlmOutput> {
    const contents: any[] = [];

    for (const msg of options.messages) {
      if (msg.role === "system") {
        continue;
      }

      if (msg.role === "tool") {
        contents.push({
          role: "user",
          parts: [
            {
              text: `[Resultado da Ferramenta ${msg.name || "agenda"}]: ${msg.content}`,
            },
          ],
        });
      } else {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
    }

    if (contents.length === 0) {
      contents.push({
        role: "user",
        parts: [{ text: "Olá" }],
      });
    }

    const config: any = {};
    if (options.systemPrompt) {
      config.systemInstruction = options.systemPrompt;
    }

    if (options.tools && options.tools.length > 0) {
      config.tools = [
        {
          functionDeclarations: options.tools.map((t) => ({
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          })),
        },
      ];
    }

    const response = await this.client.models.generateContent({
      model: this.model,
      contents,
      config,
    });

    const toolCalls: LlmToolCall[] = [];
    if (response.functionCalls && response.functionCalls.length > 0) {
      for (const fc of response.functionCalls) {
        toolCalls.push({
          id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: fc.name || "",
          arguments: (fc.args as Record<string, any>) || {},
        });
      }
    }

    return {
      text: response.text || undefined,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };
  }
}
