import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { SchedulingController } from "../controllers/SchedulingController.js";
import { WhatsAppController } from "../controllers/WhatsAppController.js";
import { createAuthRoutes } from "./authRoutes.js";
import { createSchedulingRoutes } from "./schedulingRoutes.js";
import { createWhatsAppRoutes } from "./whatsappRoutes.js";

export function createApiRouter(
  authController: AuthController,
  schedulingController: SchedulingController,
  whatsAppController: WhatsAppController
): Router {
  const router = Router();

  router.use("/auth", createAuthRoutes(authController));
  router.use("/scheduling", createSchedulingRoutes(schedulingController));
  router.use("/whatsapp", createWhatsAppRoutes(whatsAppController));

  // Direct backwards-compatibility aliases
  router.use("/", createAuthRoutes(authController));

  return router;
}
