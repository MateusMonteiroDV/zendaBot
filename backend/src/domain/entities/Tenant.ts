export interface TenantGoogleCalendarConfig {
  calendarId: string;
  timeZone: string;
  businessHoursStart: string; // "08:00"
  businessHoursEnd: string;   // "18:00"
  appointmentDurationMinutes: number; // 30
  apiKey?: string;
  serviceAccountEmail?: string;
  serviceAccountPrivateKey?: string;
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
}

export class Tenant {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public businessName: string,
    public calendarConfig: TenantGoogleCalendarConfig,
    public createdAt: Date = new Date()
  ) {}

  public static defaultCalendarConfig(): TenantGoogleCalendarConfig {
    return {
      calendarId: "primary",
      timeZone: "America/Sao_Paulo",
      businessHoursStart: "08:00",
      businessHoursEnd: "18:00",
      appointmentDurationMinutes: 30,
    };
  }
}
