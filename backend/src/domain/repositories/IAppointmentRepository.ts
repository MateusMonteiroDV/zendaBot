import { Appointment } from "../entities/Appointment.js";

export interface IAppointmentRepository {
  save(appointment: Appointment): Promise<void>;
  findById(id: string): Promise<Appointment | null>;
  findByGoogleEventId(googleEventId: string): Promise<Appointment | null>;
  findByTenantAndPhone(tenantId: string, clientPhone: string): Promise<Appointment[]>;
  update(appointment: Appointment): Promise<void>;
}
