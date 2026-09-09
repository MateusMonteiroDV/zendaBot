import { Request, Response } from "express";
import { GetAvailableSlotsUseCase } from "../../../application/use-cases/scheduling/GetAvailableSlotsUseCase.js";
import { BookAppointmentUseCase } from "../../../application/use-cases/scheduling/BookAppointmentUseCase.js";
import { CancelAppointmentUseCase } from "../../../application/use-cases/scheduling/CancelAppointmentUseCase.js";
import { ListAppointmentsUseCase } from "../../../application/use-cases/scheduling/ListAppointmentsUseCase.js";
import { ITenantRepository } from "../../../domain/repositories/ITenantRepository.js";

export class SchedulingController {
  constructor(
    private getAvailableSlotsUseCase: GetAvailableSlotsUseCase,
    private bookAppointmentUseCase: BookAppointmentUseCase,
    private cancelAppointmentUseCase: CancelAppointmentUseCase,
    private listAppointmentsUseCase: ListAppointmentsUseCase,
    private tenantRepository: ITenantRepository
  ) {}

  async getSlots(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const date = (req.query.date as string) || new Date().toISOString().split("T")[0];

      const slots = await this.getAvailableSlotsUseCase.execute({ tenantId, date });
      res.status(200).json({ tenantId, date, slots });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ message: err.message || "Erro ao consultar horários" });
    }
  }

  async bookAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const { clientName, clientPhone, clientEmail, startTime, endTime, serviceName, notes } = req.body;

      const appointment = await this.bookAppointmentUseCase.execute({
        tenantId,
        clientName,
        clientPhone,
        clientEmail,
        startTime,
        endTime,
        serviceName,
        notes,
      });

      res.status(201).json({
        message: "Consulta agendada com sucesso no Google Agenda",
        appointment,
      });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ message: err.message || "Erro ao agendar consulta" });
    }
  }

  async cancelAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const { eventId, clientPhone } = req.body;

      const target = eventId || clientPhone;
      const success = await this.cancelAppointmentUseCase.execute({
        tenantId,
        eventIdOrPhone: target,
      });

      res.status(200).json({
        message: "Consulta cancelada com sucesso no Google Agenda",
        success,
      });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ message: err.message || "Erro ao cancelar consulta" });
    }
  }

  async listAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const phone = (req.query.phone as string) || "";

      const list = await this.listAppointmentsUseCase.execute(tenantId, phone);
      res.status(200).json({ tenantId, appointments: list });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ message: err.message });
    }
  }

  async getCalendarConfig(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const config = await this.tenantRepository.getCalendarConfig(tenantId);
      res.status(200).json(config || {});
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ message: err.message });
    }
  }

  async updateCalendarConfig(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      await this.tenantRepository.updateCalendarConfig(tenantId, req.body);
      res.status(200).json({ message: "Configurações do Google Calendar atualizadas" });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ message: err.message });
    }
  }
}
