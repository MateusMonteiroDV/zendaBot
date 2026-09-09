import { Router } from "express";
import { SchedulingController } from "../controllers/SchedulingController.js";

export function createSchedulingRoutes(schedulingController: SchedulingController): Router {
  const router = Router();

  router.get("/:tenantId/slots", (req, res) => schedulingController.getSlots(req, res));
  router.post("/:tenantId/book", (req, res) => schedulingController.bookAppointment(req, res));
  router.post("/:tenantId/cancel", (req, res) => schedulingController.cancelAppointment(req, res));
  router.get("/:tenantId/appointments", (req, res) => schedulingController.listAppointments(req, res));
  router.get("/:tenantId/config", (req, res) => schedulingController.getCalendarConfig(req, res));
  router.put("/:tenantId/config", (req, res) => schedulingController.updateCalendarConfig(req, res));

  return router;
}
