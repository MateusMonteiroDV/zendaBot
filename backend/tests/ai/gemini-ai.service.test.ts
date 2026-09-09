import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { SchedulingAIService } from "../../src/infrastructure/external/ai/SchedulingAIService.js";
import { GeminiLlmProvider } from "../../src/infrastructure/external/ai/GeminiLlmProvider.js";
import { ILlmProvider } from "../../src/infrastructure/external/ai/ILlmProvider.js";
import { LlmProviderFactory } from "../../src/infrastructure/external/ai/LlmProviderFactory.js";
import { GetAvailableSlotsUseCase } from "../../src/application/use-cases/scheduling/GetAvailableSlotsUseCase.js";
import { BookAppointmentUseCase } from "../../src/application/use-cases/scheduling/BookAppointmentUseCase.js";
import { CancelAppointmentUseCase } from "../../src/application/use-cases/scheduling/CancelAppointmentUseCase.js";
import { ListAppointmentsUseCase } from "../../src/application/use-cases/scheduling/ListAppointmentsUseCase.js";
import { AIConversationContext } from "../../src/domain/repositories/IAIService.js";

describe("Gemini & Multi-LLM Provider AI Service Tests", () => {
  let aiService: SchedulingAIService;
  let mockGeminiProvider: jest.Mocked<ILlmProvider>;
  let mockGetSlots: jest.Mocked<GetAvailableSlotsUseCase>;
  let mockBook: jest.Mocked<BookAppointmentUseCase>;
  let mockCancel: jest.Mocked<CancelAppointmentUseCase>;
  let mockList: jest.Mocked<ListAppointmentsUseCase>;

  const baseContext: AIConversationContext = {
    tenantId: "tenant_clinic_gemini",
    businessName: "Clínica Vida Saudável",
    clientPhone: "5511988887777",
    clientName: "Beatriz",
    currentDate: "2026-10-30",
    timeZone: "America/Sao_Paulo",
  };

  beforeEach(() => {
    mockGeminiProvider = {
      providerName: "gemini",
      chat: jest.fn(),
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

    aiService = new SchedulingAIService(
      mockGeminiProvider,
      mockGetSlots,
      mockBook,
      mockCancel,
      mockList
    );
  });

  describe("LlmProviderFactory", () => {
    it("should default to Gemini provider when no provider is specified", () => {
      delete process.env.AI_PROVIDER;
      const provider = LlmProviderFactory.createProvider();
      expect(provider.providerName).toBe("gemini");
      expect(provider).toBeInstanceOf(GeminiLlmProvider);
    });

    it("should correctly instantiate requested providers (groq, openai, claude)", () => {
      const groq = LlmProviderFactory.createProvider("groq");
      expect(groq.providerName).toBe("groq");

      const openai = LlmProviderFactory.createProvider("openai");
      expect(openai.providerName).toBe("openai");

      const claude = LlmProviderFactory.createProvider("claude");
      expect(claude.providerName).toBe("claude");
    });
  });

  describe("Google Gemini Tool Calling with Google Calendar", () => {
    it("should call consultar_horarios_disponiveis via Gemini and return formatted availability", async () => {
      // 1st turn: Gemini invokes tool
      mockGeminiProvider.chat.mockResolvedValueOnce({
        toolCalls: [
          {
            id: "gemini_call_001",
            name: "consultar_horarios_disponiveis",
            arguments: { data: "2026-10-30" },
          },
        ],
      });

      // 2nd turn: Gemini receives tool output and returns text to client
      mockGeminiProvider.chat.mockResolvedValueOnce({
        text: "Olá Beatriz! No dia 30/10 temos os seguintes horários livres no Google Agenda: 09:00 e 10:30. Qual prefere?",
      });

      mockGetSlots.execute.mockResolvedValue([
        { startTime: "2026-10-30T09:00:00Z", endTime: "2026-10-30T09:30:00Z", available: true },
        { startTime: "2026-10-30T10:30:00Z", endTime: "2026-10-30T11:00:00Z", available: true },
      ]);

      const reply = await aiService.generateReply("Quais horários você tem para hoje?", baseContext);

      expect(mockGetSlots.execute).toHaveBeenCalledWith({
        tenantId: baseContext.tenantId,
        date: "2026-10-30",
      });
      expect(reply).toContain("temos os seguintes horários livres no Google Agenda");
      expect(mockGeminiProvider.chat).toHaveBeenCalledTimes(2);
    });

    it("should call agendar_consulta via Gemini and confirm on Google Calendar", async () => {
      mockGeminiProvider.chat.mockResolvedValueOnce({
        toolCalls: [
          {
            id: "gemini_call_002",
            name: "agendar_consulta",
            arguments: {
              nome_cliente: "Beatriz",
              data: "2026-10-30",
              horario: "15:00",
              servico: "Consulta Geral",
            },
          },
        ],
      });

      mockGeminiProvider.chat.mockResolvedValueOnce({
        text: "Perfeito, Beatriz! Sua consulta foi agendada no Google Agenda para o dia 30/10 às 15:00. Te esperamos lá! ✅",
      });

      mockBook.execute.mockResolvedValue({
        id: "appt_gemini_1",
        googleEventId: "gcal_evt_gemini_1",
        tenantId: baseContext.tenantId,
        clientName: "Beatriz",
        clientPhone: baseContext.clientPhone,
        startTime: "2026-10-30T15:00:00",
        endTime: "2026-10-30T15:30:00",
        status: "scheduled",
        summary: "Consulta - Beatriz",
      });

      const reply = await aiService.generateReply("Por favor, agende para mim às 15:00", baseContext);

      expect(mockBook.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: baseContext.tenantId,
          clientName: "Beatriz",
          startTime: "2026-10-30T15:00:00",
          serviceName: "Consulta Geral",
        })
      );
      expect(reply).toContain("Sua consulta foi agendada no Google Agenda");
    });

    it("should call cancelar_consulta via Gemini and delete from Google Calendar", async () => {
      mockGeminiProvider.chat.mockResolvedValueOnce({
        toolCalls: [
          {
            id: "gemini_call_003",
            name: "cancelar_consulta",
            arguments: { motivo: "Imprevisto pessoal" },
          },
        ],
      });

      mockGeminiProvider.chat.mockResolvedValueOnce({
        text: "Sua consulta foi cancelada com sucesso no Google Agenda. Quando desejar remarcar, estamos à disposição! ✅",
      });

      mockCancel.execute.mockResolvedValue(true);

      const reply = await aiService.generateReply("Preciso cancelar meu agendamento", baseContext);

      expect(mockCancel.execute).toHaveBeenCalledWith({
        tenantId: baseContext.tenantId,
        eventIdOrPhone: baseContext.clientPhone,
      });
      expect(reply).toContain("cancelada com sucesso no Google Agenda");
    });
  });

  describe("Resilient Fallback when Gemini API is unavailable or offline", () => {
    it("should trigger fallbackIntentHandler for cancellation when Gemini API throws", async () => {
      mockGeminiProvider.chat.mockRejectedValue(new Error("Gemini quota exceeded or network offline"));
      mockCancel.execute.mockResolvedValue(true);

      const reply = await aiService.generateReply("Quero cancelar minha consulta", baseContext);

      expect(mockCancel.execute).toHaveBeenCalledWith({
        tenantId: baseContext.tenantId,
        eventIdOrPhone: baseContext.clientPhone,
      });
      expect(reply).toContain("cancelada com sucesso no Google Agenda");
    });

    it("should trigger fallbackIntentHandler for scheduling with date and time", async () => {
      mockGeminiProvider.chat.mockRejectedValue(new Error("Gemini 503 Service Unavailable"));
      mockBook.execute.mockResolvedValue({} as any);

      const reply = await aiService.generateReply("Quero agendar amanhã às 16:00", baseContext);

      expect(mockBook.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: baseContext.tenantId,
          clientPhone: baseContext.clientPhone,
        })
      );
      expect(reply).toContain("Agendamento confirmado com sucesso no Google Agenda");
    });
  });
});
