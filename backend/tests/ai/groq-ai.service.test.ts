import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { GroqAIService } from "../../src/infrastructure/external/groq/GroqAIService.js";
import { GetAvailableSlotsUseCase } from "../../src/application/use-cases/scheduling/GetAvailableSlotsUseCase.js";
import { BookAppointmentUseCase } from "../../src/application/use-cases/scheduling/BookAppointmentUseCase.js";
import { CancelAppointmentUseCase } from "../../src/application/use-cases/scheduling/CancelAppointmentUseCase.js";
import { ListAppointmentsUseCase } from "../../src/application/use-cases/scheduling/ListAppointmentsUseCase.js";
import { AIConversationContext } from "../../src/domain/repositories/IAIService.js";

describe("GroqAIService & Google Calendar AI Tool Calling Tests", () => {
  let groqService: GroqAIService;
  let mockGroqClient: any;
  let mockGetSlots: jest.Mocked<GetAvailableSlotsUseCase>;
  let mockBook: jest.Mocked<BookAppointmentUseCase>;
  let mockCancel: jest.Mocked<CancelAppointmentUseCase>;
  let mockList: jest.Mocked<ListAppointmentsUseCase>;

  const baseContext: AIConversationContext = {
    tenantId: "tenant_dentist_01",
    businessName: "Odonto Clean",
    clientPhone: "5511999991111",
    clientName: "Lucas",
    currentDate: "2026-10-25",
    timeZone: "America/Sao_Paulo",
  };

  beforeEach(() => {
    mockGroqClient = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    };

    mockGetSlots = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetAvailableSlotsUseCase>;

    mockBook = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<BookAppointmentUseCase>;

    mockCancel = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CancelAppointmentUseCase>;

    mockList = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ListAppointmentsUseCase>;

    groqService = new GroqAIService(
      mockGroqClient,
      mockGetSlots,
      mockBook,
      mockCancel,
      mockList
    );
  });

  describe("Function Calling via LLM", () => {
    it("should execute consultar_horarios_disponiveis tool and formulate reply", async () => {
      // First turn: model asks to call tool
      mockGroqClient.chat.completions.create
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                role: "assistant",
                content: null,
                tool_calls: [
                  {
                    id: "call_abc123",
                    type: "function",
                    function: {
                      name: "consultar_horarios_disponiveis",
                      arguments: JSON.stringify({ data: "2026-10-25" }),
                    },
                  },
                ],
              },
            },
          ],
        })
        // Second turn: model formulates final response after seeing tool output
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                role: "assistant",
                content: "Temos horários disponíveis no Google Agenda às 09:00 e 10:00!",
              },
            },
          ],
        });

      mockGetSlots.execute.mockResolvedValue([
        { startTime: "2026-10-25T09:00:00Z", endTime: "2026-10-25T09:30:00Z", available: true },
        { startTime: "2026-10-25T10:00:00Z", endTime: "2026-10-25T10:30:00Z", available: true },
      ]);

      const reply = await groqService.generateReply("Tem horário para hoje?", baseContext);

      expect(mockGetSlots.execute).toHaveBeenCalledWith({
        tenantId: baseContext.tenantId,
        date: "2026-10-25",
      });
      expect(reply).toContain("Temos horários disponíveis");
    });

    it("should execute agendar_consulta tool and confirm appointment in Google Agenda", async () => {
      mockGroqClient.chat.completions.create
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                role: "assistant",
                content: null,
                tool_calls: [
                  {
                    id: "call_book_1",
                    type: "function",
                    function: {
                      name: "agendar_consulta",
                      arguments: JSON.stringify({
                        nome_cliente: "Lucas",
                        data: "2026-10-26",
                        horario: "14:00",
                        servico: "Avaliação",
                      }),
                    },
                  },
                ],
              },
            },
          ],
        })
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                role: "assistant",
                content: "✅ Consulta agendada com sucesso no Google Agenda para o dia 26/10 às 14:00!",
              },
            },
          ],
        });

      mockBook.execute.mockResolvedValue({
        id: "app_1",
        googleEventId: "gcal_evt_1",
        tenantId: baseContext.tenantId,
        clientName: "Lucas",
        clientPhone: baseContext.clientPhone,
        startTime: "2026-10-26T14:00:00",
        endTime: "2026-10-26T14:30:00",
        status: "scheduled",
        summary: "Consulta - Lucas",
      });

      const reply = await groqService.generateReply("Quero agendar amanhã às 14:00", baseContext);

      expect(mockBook.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: baseContext.tenantId,
          clientName: "Lucas",
          startTime: "2026-10-26T14:00:00",
        })
      );
      expect(reply).toContain("Consulta agendada com sucesso no Google Agenda");
    });
  });

  describe("Fallback Intent Handler (NLP & Resiliency)", () => {
    it("should handle cancellation in natural language when LLM throws error", async () => {
      // Simulate external API error (e.g. rate limit, offline)
      mockGroqClient.chat.completions.create.mockRejectedValue(new Error("Rate limit exceeded"));
      mockCancel.execute.mockResolvedValue(true);

      const reply = await groqService.generateReply("Gostaria de cancelar meu agendamento por favor", baseContext);

      expect(mockCancel.execute).toHaveBeenCalledWith({
        tenantId: baseContext.tenantId,
        eventIdOrPhone: baseContext.clientPhone,
      });
      expect(reply).toContain("cancelada com sucesso no Google Agenda");
    });

    it("should handle scheduling in natural language fallback", async () => {
      mockGroqClient.chat.completions.create.mockRejectedValue(new Error("Timeout"));
      mockBook.execute.mockResolvedValue({} as any);

      const reply = await groqService.generateReply("Quero agendar 2026-11-05 às 15:30", baseContext);

      expect(mockBook.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: baseContext.tenantId,
          startTime: "2026-11-05T15:30:00",
        })
      );
      expect(reply).toContain("Agendamento confirmado com sucesso no Google Agenda");
    });

    it("should handle slot availability in natural language fallback", async () => {
      mockGroqClient.chat.completions.create.mockRejectedValue(new Error("Network issue"));
      mockGetSlots.execute.mockResolvedValue([
        { startTime: "2026-10-25T14:00:00Z", endTime: "2026-10-25T14:30:00Z", available: true },
        { startTime: "2026-10-25T15:00:00Z", endTime: "2026-10-25T15:30:00Z", available: true },
      ]);

      const reply = await groqService.generateReply("Quais os horários vagos hoje?", baseContext);

      expect(mockGetSlots.execute).toHaveBeenCalled();
      expect(reply).toContain("Horários disponíveis no Google Agenda");
    });
  });
});
