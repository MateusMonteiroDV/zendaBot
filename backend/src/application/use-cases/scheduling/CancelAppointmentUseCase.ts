import { Tenant } from "../../../domain/entities/Tenant.js";
import { ITenantRepository } from "../../../domain/repositories/ITenantRepository.js";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository.js";
import { IGoogleCalendarService } from "../../../domain/repositories/IGoogleCalendarService.js";
import { AppError } from "../../../domain/errors/AppError.js";
import { CancelAppointmentInputDto } from "../../dtos/SchedulingDto.js";

export class CancelAppointmentUseCase {
  constructor(
    private tenantRepository: ITenantRepository,
    private appointmentRepository: IAppointmentRepository,
    private googleCalendarService: IGoogleCalendarService
  ) {}

  async execute(input: CancelAppointmentInputDto): Promise<boolean> {
    if (!input.tenantId) throw new AppError("tenantId é obrigatório.");
    if (!input.eventIdOrPhone) throw new AppError("eventId ou telefone é obrigatório.");

    let config = await this.tenantRepository.getCalendarConfig(input.tenantId);
    if (!config) {
      config = Tenant.defaultCalendarConfig();
    }

    const cleanInput = input.eventIdOrPhone.trim();
    let googleEventId = cleanInput;

    // Check if input is a phone number
    const isPhone = /^[\d+() -]{8,}$/.test(cleanInput);
    if (isPhone) {
      const appointments = await this.appointmentRepository.findByTenantAndPhone(
        input.tenantId,
        cleanInput
      );
      const activeAppointment = appointments.find((a) => !a.isCancelled());

      if (activeAppointment) {
        googleEventId = activeAppointment.googleEventId;
      } else {
        // Search directly on Google Calendar
        const events = await this.googleCalendarService.findEventsByPhone(config, cleanInput);
        if (!events || events.length === 0) {
          throw new AppError("Nenhum agendamento ativo encontrado para este telefone.");
        }
        googleEventId = events[0].id;
      }
    }

    // Delete from Google Calendar
    const deleted = await this.googleCalendarService.deleteEvent(config, googleEventId);

    // Update local database if present
    const local = await this.appointmentRepository.findByGoogleEventId(googleEventId);
    if (local) {
      local.cancel();
      await this.appointmentRepository.update(local);
    }

    return deleted;
  }
}
