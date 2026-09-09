import { ILlmProvider } from "./ILlmProvider.js";
import { GeminiLlmProvider } from "./GeminiLlmProvider.js";
import { GroqLlmProvider } from "./GroqLlmProvider.js";
import { OpenAILlmProvider } from "./OpenAILlmProvider.js";
import { ClaudeLlmProvider } from "./ClaudeLlmProvider.js";

export type SupportedProvider = "gemini" | "groq" | "openai" | "claude";

export class LlmProviderFactory {
  /**
   * Cria o provedor de LLM com base na variável de ambiente AI_PROVIDER ou argumento explícito.
   * O padrão adotado pelo projeto é o Google Gemini ("gemini").
   */
  public static createProvider(providerName?: string): ILlmProvider {
    const provider = (providerName || process.env.AI_PROVIDER || "gemini").toLowerCase();

    switch (provider) {
      case "gemini":
      case "google":
        return new GeminiLlmProvider();

      case "groq":
        return new GroqLlmProvider();

      case "openai":
      case "gpt":
        return new OpenAILlmProvider();

      case "claude":
      case "anthropic":
        return new ClaudeLlmProvider();

      default:
        console.warn(`[LlmProviderFactory] Provedor "${provider}" desconhecido. Utilizando "gemini" como padrão.`);
        return new GeminiLlmProvider();
    }
  }
}
