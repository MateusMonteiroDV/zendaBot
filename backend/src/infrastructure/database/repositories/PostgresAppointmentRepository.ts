import pool from "../connection.js";
import { Appointment } from "../../../domain/entities/Appointment.js";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository.js";

export class PostgresAppointmentRepository implements IAppointmentRepository {
  private memoryAppointments: Map<string, Appointment> = new Map();

  async save(appointment: Appointment): Promise<void> {
    this.memoryAppointments.set(appointment.id, appointment);

    try {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO appointments 
           (id, tenant_id, client_phone, client_name, google_event_id, start_time, end_time, status, summary, description, client_email)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE 
           SET status = EXCLUDED.status,
               start_time = EXCLUDED.start_time,
               end_time = EXCLUDED.end_time`,
          [
            appointment.id,
            appointment.tenantId,
            appointment.clientPhone,
            appointment.clientName,
            appointment.googleEventId,
            appointment.startTime.toISOString(),
            appointment.endTime.toISOString(),
            appointment.status,
            appointment.summary,
            appointment.description || null,
            appointment.clientEmail || null,
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      // Memory persistence
    }
  }

  async findById(id: string): Promise<Appointment | null> {
    if (this.memoryAppointments.has(id)) {
      return this.memoryAppointments.get(id)!;
    }

    try {
      const client = await pool.connect();
      try {
        const res = await client.query("SELECT * FROM appointments WHERE id = $1", [id]);
        if (res.rows.length === 0) return null;
        return this.mapRow(res.rows[0]);
      } finally {
        client.release();
      }
    } catch {
      return null;
    }
  }

  async findByGoogleEventId(googleEventId: string): Promise<Appointment | null> {
    for (const a of this.memoryAppointments.values()) {
      if (a.googleEventId === googleEventId) return a;
    }

    try {
      const client = await pool.connect();
      try {
        const res = await client.query("SELECT * FROM appointments WHERE google_event_id = $1", [googleEventId]);
        if (res.rows.length === 0) return null;
        return this.mapRow(res.rows[0]);
      } finally {
        client.release();
      }
    } catch {
      return null;
    }
  }

  async findByTenantAndPhone(tenantId: string, clientPhone: string): Promise<Appointment[]> {
    const list: Appointment[] = [];
    for (const a of this.memoryAppointments.values()) {
      if (a.tenantId === tenantId && a.clientPhone === clientPhone) {
        list.push(a);
      }
    }
    if (list.length > 0) return list;

    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          "SELECT * FROM appointments WHERE tenant_id = $1 AND client_phone = $2 ORDER BY start_time ASC",
          [tenantId, clientPhone]
        );
        return res.rows.map((r) => this.mapRow(r));
      } finally {
        client.release();
      }
    } catch {
      return list;
    }
  }

  async update(appointment: Appointment): Promise<void> {
    this.memoryAppointments.set(appointment.id, appointment);

    try {
      const client = await pool.connect();
      try {
        await client.query(
          "UPDATE appointments SET status = $1, start_time = $2, end_time = $3 WHERE id = $4",
          [
            appointment.status,
            appointment.startTime.toISOString(),
            appointment.endTime.toISOString(),
            appointment.id,
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      // Handled in memory
    }
  }

  private mapRow(row: any): Appointment {
    return new Appointment(
      row.id,
      row.tenant_id,
      row.client_phone,
      row.client_name,
      row.google_event_id,
      new Date(row.start_time),
      new Date(row.end_time),
      row.status,
      row.summary,
      row.description,
      row.client_email,
      row.created_at
    );
  }
}
