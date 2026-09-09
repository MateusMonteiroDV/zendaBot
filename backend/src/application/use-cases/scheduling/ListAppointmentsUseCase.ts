import { Tenant } from "../../../domain/entities/Tenant.js";
import { Appointment } from "../../../domain/entities/Appointment.js";
import { ITenantRepository } from "../../../domain/repositories/ITenantRepository.js";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository.js";
import { IGoogleCalendarService } from "../../../domain/repositories/IGoogleCalendarService.js";

export class ListAppointmentsUseCase {
  constructor(
    private tenantRepository: ITenantRepository,
    private appointmentRepository: IAppointmentRepository,
    private googleCalendarService: IGoogleCalendarService
  ) {}

  async execute(tenantId: string, clientPhone: string): Promise<Appointment[]> {
    const local = await this.appointmentRepository.findByTenantAndPhone(tenantId, clientPhone);
    if (local.length > 0) {
      return local;
    }

    let config = await this.tenantRepository.getCalendarConfig(tenantId);
    if (!config) {
      config = Tenant.defaultCalendarConfig();
    }

    const gcalEvents = await this.googleCalendarService.findEventsByPhone(config, clientPhone);
    return gcalEvents.map(
      (e) =>
        new Appointment(
          e.id,
          tenantId,
          clientPhone,
          e.summary.replace("Consulta - ", ""),
          e.id,
          new Date(e.startTime),
          new Date(e.endTime),
          e.status === "cancelled" ? "cancelled" : "scheduled",
          e.summary,
          e.description
        )
    );
  }
}
