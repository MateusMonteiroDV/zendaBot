import { Request, Response } from "express";
import { WhatsAppSessionManager } from "../../../infrastructure/external/whatsapp/WhatsAppSessionManager.js";
import { ProcessWhatsAppMessageUseCase } from "../../../application/use-cases/whatsapp/ProcessWhatsAppMessageUseCase.js";

export class WhatsAppController {
  constructor(
    private sessionManager: WhatsAppSessionManager,
    private processWhatsAppMessageUseCase: ProcessWhatsAppMessageUseCase
  ) {}

  async startSession(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      await this.sessionManager.startSession(tenantId);
      res.status(200).json({ message: `Sessão WhatsApp iniciada para o Tenant ${tenantId}` });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Erro ao iniciar sessão WhatsApp" });
    }
  }

  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const status = this.sessionManager.getSessionStatus(tenantId);
      res.status(200).json(status);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Erro ao consultar status WhatsApp" });
    }
  }

  async incomingWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const payload = req.body;
      const reply = await this.processWhatsAppMessageUseCase.execute(payload, { tenantId });
      res.status(200).json({ status: "processed", reply });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Erro ao processar mensagem webhook" });
    }
  }

  async disconnectSession(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      await this.sessionManager.closeSession(tenantId);
      res.status(200).json({ message: `Sessão WhatsApp desconectada para o Tenant ${tenantId}` });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Erro ao desconectar WhatsApp" });
    }
  }
}
