import { Tenant, TenantGoogleCalendarConfig } from "../entities/Tenant.js";

export interface ITenantRepository {
  findById(id: string): Promise<Tenant | null>;
  findByEmail(email: string): Promise<Tenant | null>;
  save(tenant: Tenant): Promise<void>;
  getCalendarConfig(tenantId: string): Promise<TenantGoogleCalendarConfig | null>;
  updateCalendarConfig(tenantId: string, config: TenantGoogleCalendarConfig): Promise<void>;
}
