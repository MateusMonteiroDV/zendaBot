import pool from "../connection.js";
import { Tenant, TenantGoogleCalendarConfig } from "../../../domain/entities/Tenant.js";
import { ITenantRepository } from "../../../domain/repositories/ITenantRepository.js";

export class PostgresTenantRepository implements ITenantRepository {
  private memoryTenants: Map<string, Tenant> = new Map();

  async findById(id: string): Promise<Tenant | null> {
    if (this.memoryTenants.has(id)) {
      return this.memoryTenants.get(id)!;
    }

    try {
      const client = await pool.connect();
      try {
        const res = await client.query("SELECT * FROM user_owner WHERE id = $1", [id]);
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        const tenant = new Tenant(
          row.id,
          row.user_name,
          row.email,
          row.business_name || row.user_name,
          {
            calendarId: row.calendar_id || "primary",
            timeZone: row.timezone || "America/Sao_Paulo",
            businessHoursStart: row.business_hours_start || "08:00",
            businessHoursEnd: row.business_hours_end || "18:00",
            appointmentDurationMinutes: row.appointment_duration_minutes || 30,
          },
          row.created_at
        );
        this.memoryTenants.set(tenant.id, tenant);
        return tenant;
      } finally {
        client.release();
      }
    } catch {
      return null;
    }
  }

  async findByEmail(email: string): Promise<Tenant | null> {
    for (const t of this.memoryTenants.values()) {
      if (t.email.toLowerCase() === email.toLowerCase()) return t;
    }

    try {
      const client = await pool.connect();
      try {
        const res = await client.query("SELECT * FROM user_owner WHERE email = $1", [email]);
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        const tenant = new Tenant(
          row.id,
          row.user_name,
          row.email,
          row.business_name || row.user_name,
          {
            calendarId: row.calendar_id || "primary",
            timeZone: row.timezone || "America/Sao_Paulo",
            businessHoursStart: row.business_hours_start || "08:00",
            businessHoursEnd: row.business_hours_end || "18:00",
            appointmentDurationMinutes: row.appointment_duration_minutes || 30,
          },
          row.created_at
        );
        this.memoryTenants.set(tenant.id, tenant);
        return tenant;
      } finally {
        client.release();
      }
    } catch {
      return null;
    }
  }

  async save(tenant: Tenant): Promise<void> {
    this.memoryTenants.set(tenant.id, tenant);

    try {
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE user_owner 
           SET business_name = $1, 
               calendar_id = $2, 
               timezone = $3, 
               business_hours_start = $4, 
               business_hours_end = $5, 
               appointment_duration_minutes = $6 
           WHERE id = $7`,
          [
            tenant.businessName,
            tenant.calendarConfig.calendarId,
            tenant.calendarConfig.timeZone,
            tenant.calendarConfig.businessHoursStart,
            tenant.calendarConfig.businessHoursEnd,
            tenant.calendarConfig.appointmentDurationMinutes,
            tenant.id,
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      // Handled in memory
    }
  }

  async getCalendarConfig(tenantId: string): Promise<TenantGoogleCalendarConfig | null> {
    const tenant = await this.findById(tenantId);
    if (!tenant) return null;
    return tenant.calendarConfig;
  }

  async updateCalendarConfig(
    tenantId: string,
    config: TenantGoogleCalendarConfig
  ): Promise<void> {
    const tenant = await this.findById(tenantId);
    if (tenant) {
      tenant.calendarConfig = config;
      this.memoryTenants.set(tenantId, tenant);
    }

    try {
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE user_owner 
           SET calendar_id = $1, 
               timezone = $2, 
               business_hours_start = $3, 
               business_hours_end = $4, 
               appointment_duration_minutes = $5 
           WHERE id = $6`,
          [
            config.calendarId,
            config.timeZone,
            config.businessHoursStart,
            config.businessHoursEnd,
            config.appointmentDurationMinutes,
            tenantId,
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      // Memory updated
    }
  }

  public setInMemoryTenant(tenant: Tenant): void {
    this.memoryTenants.set(tenant.id, tenant);
  }
}
