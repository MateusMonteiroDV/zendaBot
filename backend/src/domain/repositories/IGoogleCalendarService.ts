import { TenantGoogleCalendarConfig } from "../entities/Tenant.js";

export interface TimeSlot {
  startTime: string; // ISO String
  endTime: string;   // ISO String
  available: boolean;
}

export interface GoogleCalendarEventInput {
  calendarId?: string;
  summary: string;
  description?: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  timeZone: string;
  attendeeEmail?: string;
}

export interface GoogleCalendarEventOutput {
  id: string;
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface IGoogleCalendarService {
  getAvailableSlots(
    config: TenantGoogleCalendarConfig,
    date: string // YYYY-MM-DD
  ): Promise<TimeSlot[]>;

  createEvent(
    config: TenantGoogleCalendarConfig,
    input: GoogleCalendarEventInput
  ): Promise<GoogleCalendarEventOutput>;

  deleteEvent(
    config: TenantGoogleCalendarConfig,
    eventId: string
  ): Promise<boolean>;

  findEventsByPhone(
    config: TenantGoogleCalendarConfig,
    phone: string
  ): Promise<GoogleCalendarEventOutput[]>;
}
