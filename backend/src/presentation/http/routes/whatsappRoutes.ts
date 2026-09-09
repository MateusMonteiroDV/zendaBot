import { Router } from "express";
import { WhatsAppController } from "../controllers/WhatsAppController.js";

export function createWhatsAppRoutes(whatsAppController: WhatsAppController): Router {
  const router = Router();

  router.post("/:tenantId/connect", (req, res) => whatsAppController.startSession(req, res));
  router.post("/session/:tenantId/start", (req, res) => whatsAppController.startSession(req, res));
  router.post("/:tenantId/disconnect", (req, res) => whatsAppController.disconnectSession(req, res));
  router.get("/:tenantId/status", (req, res) => whatsAppController.getStatus(req, res));
  router.get("/status/:tenantId", (req, res) => whatsAppController.getStatus(req, res));
  router.post("/:tenantId/webhook", (req, res) => whatsAppController.incomingWebhook(req, res));
  router.post("/webhook/:tenantId", (req, res) => whatsAppController.incomingWebhook(req, res));

  return router;
}
