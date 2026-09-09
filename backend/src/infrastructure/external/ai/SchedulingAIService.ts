import { IAIService, AIConversationContext } from "../../../domain/repositories/IAIService.js";
import { ILlmProvider, LlmMessage, LlmToolDefinition } from "./ILlmProvider.js";
import { LlmProviderFactory } from "./LlmProviderFactory.js";
import { GetAvailableSlotsUseCase } from "../../../application/use-cases/scheduling/GetAvailableSlotsUseCase.js";
import { BookAppointmentUseCase } from "../../../application/use-cases/scheduling/BookAppointmentUseCase.js";
import { CancelAppointmentUseCase } from "../../../application/use-cases/scheduling/CancelAppointmentUseCase.js";
import { ListAppointmentsUseCase } from "../../../application/use-cases/scheduling/ListAppointmentsUseCase.js";

export class SchedulingAIService implements IAIService {
  private memorySessions: Map<string, LlmMessage[]> = new Map();
  private llmProvider: ILlmProvider;

  constructor(
    llmProvider?: ILlmProvider,
    private getAvailableSlotsUseCase?: GetAvailableSlotsUseCase,
    private bookAppointmentUseCase?: BookAppointmentUseCase,
    private cancelAppointmentUseCase?: CancelAppointmentUseCase,
    private listAppointmentsUseCase?: ListAppointmentsUseCase
  ) {
    this.llmProvider = llmProvider || LlmProviderFactory.createProvider();
  }

  public setProvider(provider: ILlmProvider): void {
    this.llmProvider = provider;
  }

  public getProvider(): ILlmProvider {
    return this.llmProvider;
  }

  public getSessionHistory(key: string): LlmMessage[] {
    return this.memorySessions.get(key) || [];
  }

  public clearSession(key: string): void {
    this.memorySessions.delete(key);
  }

  async generateReply(
    userMessage: string,
    context: AIConversationContext
  ): Promise<string> {
    const sessionKey = `${context.tenantId}:${context.clientPhone}`;
    let history = this.memorySessions.get(sessionKey);
    if (!history) {
      history = [];
      this.memorySessions.set(sessionKey, history);
    }

    const systemPrompt = `Você é a assistente virtual inteligente e acolhedora de agendamentos no WhatsApp da empresa "${context.businessName}".
Data atual: ${context.currentDate}.
Fuso horário: ${context.timeZone}.
Telefone do cliente: ${context.clientPhone}.
Nome do cliente: ${context.clientName || "Cliente"}.

Suas atribuições:
1. Consultar disponibilidade e horários livres diretamente no Google Agenda (use a ferramenta consultar_horarios_disponiveis).
2. Agendar novas consultas/atendimentos no Google Agenda (use a ferramenta agendar_consulta). Para agendar, você precisa do nome do cliente, data (YYYY-MM-DD) e horário (HH:mm).
3. Cancelar agendamentos existentes no Google Agenda (use a ferramenta cancelar_consulta).
4. Listar consultas já marcadas para o cliente (use a ferramenta consultar_meus_agendamentos).

Diretrizes:
- Responda sempre em português brasileiro de forma educada, ágil, clara e com formatação agradável para WhatsApp (use quebras de linha e emojis).
- Seja proativo: se o cliente perguntar de horários, consulte a agenda e apresente as opções disponíveis.
- Confirme todos os detalhes com o cliente antes e após agendar ou cancelar.`;

    const tools: LlmToolDefinition[] = [
      {
        name: "consultar_horarios_disponiveis",
        description: "Consulta os horários livres no Google Agenda para uma data específica (YYYY-MM-DD).",
        parameters: {
          type: "object",
          properties: {
            data: {
              type: "string",
              description: "Data no formato YYYY-MM-DD (ex: 2026-09-10)",
            },
          },
          required: ["data"],
        },
      },
      {
        name: "agendar_consulta",
        description: "Agenda e confirma uma nova consulta diretamente no Google Agenda.",
        parameters: {
          type: "object",
          properties: {
            nome_cliente: {
              type: "string",
              description: "Nome completo do cliente",
            },
            data: {
              type: "string",
              description: "Data no formato YYYY-MM-DD",
            },
            horario: {
              type: "string",
              description: "Horário de início no formato HH:mm (ex: 14:00)",
            },
            servico: {
              type: "string",
              description: "Tipo de consulta ou serviço desejado",
            },
          },
          required: ["nome_cliente", "data", "horario"],
        },
      },
      {
        name: "cancelar_consulta",
        description: "Cancela o agendamento do cliente no Google Agenda.",
        parameters: {
          type: "object",
          properties: {
            motivo: {
              type: "string",
              description: "Motivo opcional do cancelamento",
            },
          },
        },
      },
      {
        name: "consultar_meus_agendamentos",
        description: "Consulta agendamentos marcados para este cliente no Google Agenda.",
        parameters: {
          type: "object",
          properties: {},
        },
      },
    ];

    const currentMessages: LlmMessage[] = [
      ...history.slice(-10),
      { role: "user", content: userMessage },
    ];

    try {
      // 1. First turn with LLM provider
      const llmOutput = await this.llmProvider.chat({
        systemPrompt,
        messages: currentMessages,
        tools,
      });

      if (llmOutput.toolCalls && llmOutput.toolCalls.length > 0) {
        currentMessages.push({
          role: "assistant",
          content: llmOutput.text || "Consultando informações na agenda...",
        });

        for (const toolCall of llmOutput.toolCalls) {
          const fnName = toolCall.name;
          const args = toolCall.arguments || {};
          let toolResult: any;

          if (fnName === "consultar_horarios_disponiveis" && this.getAvailableSlotsUseCase) {
            const slots = await this.getAvailableSlotsUseCase.execute({
              tenantId: context.tenantId,
              date: args.data,
            });
            const available = slots
              .filter((s) => s.available)
              .map((s) => s.startTime.split("T")[1]?.substring(0, 5) || s.startTime);
            toolResult = {
              data: args.data,
              horarios_disponiveis: available,
              total: available.length,
            };
          } else if (fnName === "agendar_consulta" && this.bookAppointmentUseCase) {
            const appointment = await this.bookAppointmentUseCase.execute({
              tenantId: context.tenantId,
              clientName: args.nome_cliente || context.clientName || "Cliente",
              clientPhone: context.clientPhone,
              startTime: `${args.data}T${args.horario}:00`,
              serviceName: args.servico,
            });
            toolResult = {
              status: "confirmado",
              mensagem: "Consulta agendada com sucesso no Google Agenda",
              appointment,
            };
          } else if (fnName === "cancelar_consulta" && this.cancelAppointmentUseCase) {
            const success = await this.cancelAppointmentUseCase.execute({
              tenantId: context.tenantId,
              eventIdOrPhone: context.clientPhone,
            });
            toolResult = {
              status: success ? "sucesso" : "erro",
              mensagem: success ? "Cancelado com sucesso no Google Agenda" : "Não foi possível cancelar",
            };
          } else if (fnName === "consultar_meus_agendamentos" && this.listAppointmentsUseCase) {
            const list = await this.listAppointmentsUseCase.execute(
              context.tenantId,
              context.clientPhone
            );
            toolResult = { agendamentos: list };
          } else {
            toolResult = { error: "Ferramenta não suportada" };
          }

          currentMessages.push({
            role: "tool",
            toolCallId: toolCall.id,
            name: fnName,
            content: JSON.stringify(toolResult),
          });
        }

        // 2. Second turn with LLM provider to synthesize the final reply
        const secondOutput = await this.llmProvider.chat({
          systemPrompt,
          messages: currentMessages,
        });

        const reply = secondOutput.text || "Operação realizada com sucesso!";
        history.push({ role: "user", content: userMessage });
        history.push({ role: "assistant", content: reply });
        return reply;
      }

      const reply = llmOutput.text || "";
      history.push({ role: "user", content: userMessage });
      history.push({ role: "assistant", content: reply });
      return reply;
    } catch (err: any) {
      console.warn(`[SchedulingAIService] Provedor ${this.llmProvider.providerName} indisponível ou erro: ${err.message}. Ativando fallback inteligente.`);
      return await this.fallbackIntentHandler(userMessage, context);
    }
  }

  /**
   * Manipulador determinístico de intenções para contingência ou testes.
   */
  public async fallbackIntentHandler(
    message: string,
    context: AIConversationContext
  ): Promise<string> {
    const lower = message.toLowerCase();

    // Cancelamento
    if (lower.includes("cancelar") || lower.includes("desmarcar")) {
      if (this.cancelAppointmentUseCase) {
        try {
          const success = await this.cancelAppointmentUseCase.execute({
            tenantId: context.tenantId,
            eventIdOrPhone: context.clientPhone,
          });
          if (success) {
            return `✅ Sua consulta foi cancelada com sucesso no Google Agenda. Se precisar de um novo horário, estamos à disposição!`;
          }
        } catch (err: any) {
          return `Não encontramos nenhuma consulta ativa para cancelamento: ${err.message}`;
        }
      }
      return "Sua solicitação de cancelamento foi recebida.";
    }

    // Agendamento com data e horário
    const dateMatch = lower.match(/(\d{4}-\d{2}-\d{2})/) || lower.match(/(\d{2}\/\d{2}\/\d{4})/);
    let targetDate = "";
    if (dateMatch) {
      if (dateMatch[1].includes("/")) {
        const [d, m, y] = dateMatch[1].split("/");
        targetDate = `${y}-${m}-${d}`;
      } else {
        targetDate = dateMatch[1];
      }
    } else if (lower.includes("amanhã") || lower.includes("amanha")) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      targetDate = d.toISOString().split("T")[0];
    } else if (lower.includes("hoje")) {
      targetDate = new Date().toISOString().split("T")[0];
    }

    const timeMatch = lower.match(/(\d{1,2})[:h](\d{2})/) || lower.match(/às (\d{1,2})/);

    if ((lower.includes("agendar") || lower.includes("marcar") || lower.includes("quero")) && targetDate && timeMatch) {
      if (this.bookAppointmentUseCase) {
        const hour = timeMatch[1].padStart(2, "0");
        const minute = timeMatch[2] || "00";
        const startTime = `${targetDate}T${hour}:${minute}:00`;
        const clientName = context.clientName || "Cliente";

        try {
          await this.bookAppointmentUseCase.execute({
            tenantId: context.tenantId,
            clientName,
            clientPhone: context.clientPhone,
            startTime,
            serviceName: "Consulta",
          });
          return `✅ Agendamento confirmado com sucesso no Google Agenda para ${targetDate} às ${hour}:${minute}!`;
        } catch (err: any) {
          return `Não foi possível agendar no Google Agenda: ${err.message}`;
        }
      }
    }

    // Consulta de disponibilidade
    if (targetDate || lower.includes("horário") || lower.includes("horarios") || lower.includes("vaga")) {
      if (this.getAvailableSlotsUseCase) {
        const queryDate = targetDate || new Date().toISOString().split("T")[0];
        const slots = await this.getAvailableSlotsUseCase.execute({
          tenantId: context.tenantId,
          date: queryDate,
        });
        const available = slots
          .filter((s) => s.available)
          .map((s) => s.startTime.split("T")[1]?.substring(0, 5) || s.startTime)
          .slice(0, 8);

        if (available.length === 0) {
          return `Não encontramos horários vagos no Google Agenda para ${queryDate}. Gostaria de ver outro dia?`;
        }
        return `📅 Horários disponíveis no Google Agenda para ${queryDate}:\n${available.map((t) => `• ${t}`).join("\n")}\n\nQual horário prefere?`;
      }
    }

    return `Olá ${context.clientName || ""}! Bem-vindo(a) à ${context.businessName}. Como posso te ajudar hoje? Posso consultar horários disponíveis, agendar ou cancelar consultas diretamente no Google Agenda.`;
  }
}
