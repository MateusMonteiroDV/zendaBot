import { v4 as uuidv4 } from "uuid";
import { Appointment } from "../../../domain/entities/Appointment.js";
import { Tenant } from "../../../domain/entities/Tenant.js";
import { ITenantRepository } from "../../../domain/repositories/ITenantRepository.js";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository.js";
import { IGoogleCalendarService } from "../../../domain/repositories/IGoogleCalendarService.js";
import { AppError } from "../../../domain/errors/AppError.js";
import { BookAppointmentInputDto, BookAppointmentOutputDto } from "../../dtos/SchedulingDto.js";

export class BookAppointmentUseCase {
  constructor(
    private tenantRepository: ITenantRepository,
    private appointmentRepository: IAppointmentRepository,
    private googleCalendarService: IGoogleCalendarService
  ) {}

  async execute(input: BookAppointmentInputDto): Promise<BookAppointmentOutputDto> {
    if (!input.tenantId) throw new AppError("tenantId é obrigatório.");
    if (!input.clientName) throw new AppError("clientName é obrigatório.");
    if (!input.clientPhone) throw new AppError("clientPhone é obrigatório.");
    if (!input.startTime) throw new AppError("startTime é obrigatório.");

    let config = await this.tenantRepository.getCalendarConfig(input.tenantId);
    if (!config) {
      config = Tenant.defaultCalendarConfig();
    }

    const startDate = new Date(input.startTime);
    if (isNaN(startDate.getTime())) {
      throw new AppError("Horário inicial inválido.");
    }

    let endDate: Date;
    if (input.endTime) {
      endDate = new Date(input.endTime);
    } else {
      const durationMs = (config.appointmentDurationMinutes || 30) * 60 * 1000;
      endDate = new Date(startDate.getTime() + durationMs);
    }

    const summary = `Consulta - ${input.clientName}`;
    const description = [
      `Cliente: ${input.clientName}`,
      `Telefone WhatsApp: ${input.clientPhone}`,
      input.serviceName ? `Serviço: ${input.serviceName}` : null,
      input.notes ? `Observações: ${input.notes}` : null,
      `Tenant ID: ${input.tenantId}`,
    ]
      .filter(Boolean)
      .join("\n");

    // 1. Insert into Google Calendar directly
    const googleEvent = await this.googleCalendarService.createEvent(config, {
      calendarId: config.calendarId || "primary",
      summary,
      description,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      timeZone: config.timeZone || "America/Sao_Paulo",
      attendeeEmail: input.clientEmail,
    });

    // 2. Persist local appointment record
    const appointmentId = uuidv4();
    const appointment = new Appointment(
      appointmentId,
      input.tenantId,
      input.clientPhone,
      input.clientName,
      googleEvent.id,
      startDate,
      endDate,
      "scheduled",
      summary,
      description,
      input.clientEmail
    );

    await this.appointmentRepository.save(appointment);

    return {
      id: appointment.id,
      googleEventId: googleEvent.id,
      tenantId: input.tenantId,
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      status: appointment.status,
      summary: appointment.summary,
    };
  }
}
