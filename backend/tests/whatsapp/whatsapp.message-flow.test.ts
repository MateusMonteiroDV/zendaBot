import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { ProcessWhatsAppMessageUseCase } from "../../src/application/use-cases/whatsapp/ProcessWhatsAppMessageUseCase.js";
import { BaileysWhatsAppAdapter } from "../../src/infrastructure/external/whatsapp/BaileysWhatsAppAdapter.js";
import { IAIService, AIConversationContext } from "../../src/domain/repositories/IAIService.js";
import { PostgresTenantRepository } from "../../src/infrastructure/database/repositories/PostgresTenantRepository.js";
import { Tenant } from "../../src/domain/entities/Tenant.js";

describe("WhatsApp Multi-Tenant Message Flow Tests", () => {
  let adapter: BaileysWhatsAppAdapter;
  let mockAIService: jest.Mocked<IAIService>;
  let tenantRepo: PostgresTenantRepository;
  let processUseCase: ProcessWhatsAppMessageUseCase;

  const tenantA = "tenant_clinica_A";
  const tenantB = "tenant_salao_B";

  beforeEach(async () => {
    adapter = new BaileysWhatsAppAdapter();
    tenantRepo = new PostgresTenantRepository();

    await tenantRepo.save(
      new Tenant(
        tenantA,
        "Clínica A",
        "clinicaA@test.com",
        "Clínica Sorriso",
        Tenant.defaultCalendarConfig()
      )
    );

    await tenantRepo.save(
      new Tenant(
        tenantB,
        "Salão B",
        "salaoB@test.com",
        "Salão de Beleza Glamour",
        Tenant.defaultCalendarConfig()
      )
    );

    mockAIService = {
      generateReply: jest.fn(),
    } as unknown as jest.Mocked<IAIService>;

    processUseCase = new ProcessWhatsAppMessageUseCase(
      adapter,
      mockAIService,
      tenantRepo
    );
  });

  describe("BaileysWhatsAppAdapter Multi-Tenant Socket Management", () => {
    it("should route messages to the correct tenant socket", async () => {
      const mockSocketA = { sendMessage: jest.fn() };
      const mockSocketB = { sendMessage: jest.fn() };

      adapter.setSocket(mockSocketA, tenantA);
      adapter.setSocket(mockSocketB, tenantB);

      await adapter.sendMessage({
        to: "5511988881111@s.whatsapp.net",
        text: "Mensagem da Clínica A",
        tenantId: tenantA,
      });

      expect(mockSocketA.sendMessage).toHaveBeenCalledWith(
        "5511988881111@s.whatsapp.net",
        { text: "Mensagem da Clínica A" }
      );
      expect(mockSocketB.sendMessage).not.toHaveBeenCalled();

      await adapter.sendMessage({
        to: "5511977772222@s.whatsapp.net",
        text: "Mensagem do Salão B",
        tenantId: tenantB,
      });

      expect(mockSocketB.sendMessage).toHaveBeenCalledWith(
        "5511977772222@s.whatsapp.net",
        { text: "Mensagem do Salão B" }
      );
    });

    it("should correctly parse text from Baileys raw incoming messages", async () => {
      const rawConversation = {
        key: { remoteJid: "5511999990000@s.whatsapp.net", fromMe: false },
        pushName: "Rodrigo",
        message: { conversation: "Olá, quero agendar uma consulta!" },
      };

      const parsed1 = await adapter.parseIncoming(rawConversation);
      expect(parsed1).toEqual({
        from: "5511999990000@s.whatsapp.net",
        senderName: "Rodrigo",
        text: "Olá, quero agendar uma consulta!",
        isFromMe: false,
      });

      const rawExtended = {
        key: { remoteJid: "5511988880000@s.whatsapp.net", fromMe: false },
        pushName: "Mariana",
        message: { extendedTextMessage: { text: "Tem horário livre amanhã?" } },
      };

      const parsed2 = await adapter.parseIncoming(rawExtended);
      expect(parsed2?.text).toBe("Tem horário livre amanhã?");
    });
  });

  describe("ProcessWhatsAppMessageUseCase", () => {
    it("should process incoming message, supply tenant context to AI, and send response back", async () => {
      const mockSocketA = { sendMessage: jest.fn() };
      adapter.setSocket(mockSocketA, tenantA);

      mockAIService.generateReply.mockResolvedValue(
        "Olá Mariana! Temos horários disponíveis amanhã às 14:00."
      );

      const rawMsg = {
        key: { remoteJid: "5511988883333@s.whatsapp.net", fromMe: false },
        pushName: "Mariana",
        message: { conversation: "Quero saber os horários para amanhã" },
      };

      const reply = await processUseCase.execute(rawMsg, {
        tenantId: tenantA,
        senderName: "Mariana",
      });

      expect(reply).toBe("Olá Mariana! Temos horários disponíveis amanhã às 14:00.");
      expect(mockAIService.generateReply).toHaveBeenCalledWith(
        "Quero saber os horários para amanhã",
        expect.objectContaining({
          tenantId: tenantA,
          businessName: "Clínica Sorriso",
          clientPhone: "5511988883333",
          clientName: "Mariana",
        })
      );

      expect(mockSocketA.sendMessage).toHaveBeenCalledWith(
        "5511988883333@s.whatsapp.net",
        { text: reply }
      );
    });

    it("should ignore messages sent by the bot itself (isFromMe = true)", async () => {
      const rawFromMe = {
        key: { remoteJid: "5511988883333@s.whatsapp.net", fromMe: true },
        message: { conversation: "Mensagem automática do bot" },
      };

      const result = await processUseCase.execute(rawFromMe, { tenantId: tenantA });
      expect(result).toBeNull();
      expect(mockAIService.generateReply).not.toHaveBeenCalled();
    });
  });
});
