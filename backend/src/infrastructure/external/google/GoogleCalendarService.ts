import { google, calendar_v3 } from "googleapis";
import {
  IGoogleCalendarService,
  TimeSlot,
  GoogleCalendarEventInput,
  GoogleCalendarEventOutput,
} from "../../../domain/repositories/IGoogleCalendarService.js";
import { TenantGoogleCalendarConfig } from "../../../domain/entities/Tenant.js";
import { AppError } from "../../../domain/errors/AppError.js";

export class GoogleCalendarService implements IGoogleCalendarService {
  /**
   * Instantiates an authenticated Google Calendar API client based on tenant credentials.
   */
  public getClient(config: TenantGoogleCalendarConfig): calendar_v3.Calendar {
    if (config.serviceAccountEmail && config.serviceAccountPrivateKey) {
      const auth = new google.auth.JWT({
        email: config.serviceAccountEmail,
        key: config.serviceAccountPrivateKey.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/calendar"],
      });
      return google.calendar({ version: "v3", auth });
    }

    if (config.refreshToken && config.clientId && config.clientSecret) {
      const oauth2Client = new google.auth.OAuth2(
        config.clientId,
        config.clientSecret
      );
      oauth2Client.setCredentials({
        refresh_token: config.refreshToken,
        access_token: config.accessToken,
      });
      return google.calendar({ version: "v3", auth: oauth2Client });
    }

    if (config.accessToken) {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: config.accessToken });
      return google.calendar({ version: "v3", auth: oauth2Client });
    }

    if (config.apiKey) {
      return google.calendar({ version: "v3", auth: config.apiKey });
    }

    // Default fallback
    return google.calendar({ version: "v3" });
  }

  async getAvailableSlots(
    config: TenantGoogleCalendarConfig,
    date: string // YYYY-MM-DD
  ): Promise<TimeSlot[]> {
    const calendar = this.getClient(config);
    const calendarId = config.calendarId || "primary";
    const timeZone = config.timeZone || "America/Sao_Paulo";

    const duration = config.appointmentDurationMinutes || 30;
    const [startH, startM] = (config.businessHoursStart || "08:00").split(":").map(Number);
    const [endH, endM] = (config.businessHoursEnd || "18:00").split(":").map(Number);

    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59`);

    let existingEvents: calendar_v3.Schema$Event[] = [];
    try {
      const res = await calendar.events.list({
        calendarId,
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
        timeZone,
      });
      existingEvents = res.data.items || [];
    } catch (err: any) {
      console.warn(`[GoogleCalendarService] Warning listing events for calendar ${calendarId}:`, err.message);
      existingEvents = [];
    }

    const busyIntervals = existingEvents
      .filter((ev) => ev.status !== "cancelled")
      .map((ev) => {
        const start = new Date(ev.start?.dateTime || ev.start?.date || "").getTime();
        const end = new Date(ev.end?.dateTime || ev.end?.date || "").getTime();
        return { start, end };
      })
      .filter((b) => !isNaN(b.start) && !isNaN(b.end));

    const slots: TimeSlot[] = [];
    const businessStartMs = new Date(
      `${date}T${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}:00`
    ).getTime();
    const businessEndMs = new Date(
      `${date}T${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`
    ).getTime();
    const slotDurationMs = duration * 60 * 1000;

    for (let current = businessStartMs; current + slotDurationMs <= businessEndMs; current += slotDurationMs) {
      const slotStart = current;
      const slotEnd = current + slotDurationMs;

      const hasConflict = busyIntervals.some(
        (b) => b.start < slotEnd && b.end > slotStart
      );

      slots.push({
        startTime: new Date(slotStart).toISOString(),
        endTime: new Date(slotEnd).toISOString(),
        available: !hasConflict,
      });
    }

    return slots;
  }

  async createEvent(
    config: TenantGoogleCalendarConfig,
    input: GoogleCalendarEventInput
  ): Promise<GoogleCalendarEventOutput> {
    const calendar = this.getClient(config);
    const calendarId = input.calendarId || config.calendarId || "primary";

    const requestBody: calendar_v3.Schema$Event = {
      summary: input.summary,
      description: input.description,
      start: {
        dateTime: input.startTime,
        timeZone: input.timeZone,
      },
      end: {
        dateTime: input.endTime,
        timeZone: input.timeZone,
      },
    };

    if (input.attendeeEmail) {
      requestBody.attendees = [{ email: input.attendeeEmail }];
    }

    try {
      const response = await calendar.events.insert({
        calendarId,
        requestBody,
      });

      const event = response.data;
      const eventId = event.id || `gcal_${Date.now()}`;

      return {
        id: eventId,
        summary: event.summary || input.summary,
        description: event.description || input.description,
        startTime: event.start?.dateTime || input.startTime,
        endTime: event.end?.dateTime || input.endTime,
        status: event.status || "confirmed",
      };
    } catch (err: any) {
      console.error(`[GoogleCalendarService] Failed to insert event:`, err.message);
      throw new AppError(`Falha ao agendar no Google Agenda: ${err.message}`, 502);
    }
  }

  async deleteEvent(
    config: TenantGoogleCalendarConfig,
    eventId: string
  ): Promise<boolean> {
    const calendar = this.getClient(config);
    const calendarId = config.calendarId || "primary";

    try {
      await calendar.events.delete({
        calendarId,
        eventId,
      });
      return true;
    } catch (err: any) {
      console.error(`[GoogleCalendarService] Failed to delete event ${eventId}:`, err.message);
      throw new AppError(`Falha ao cancelar evento no Google Agenda: ${err.message}`, 502);
    }
  }

  async findEventsByPhone(
    config: TenantGoogleCalendarConfig,
    phone: string
  ): Promise<GoogleCalendarEventOutput[]> {
    const calendar = this.getClient(config);
    const calendarId = config.calendarId || "primary";

    try {
      const res = await calendar.events.list({
        calendarId,
        q: phone,
        timeMin: new Date().toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      return (res.data.items || []).map((ev) => ({
        id: ev.id || "",
        summary: ev.summary || "",
        description: ev.description || "",
        startTime: ev.start?.dateTime || ev.start?.date || "",
        endTime: ev.end?.dateTime || ev.end?.date || "",
        status: ev.status || "confirmed",
      }));
    } catch (err: any) {
      console.warn(`[GoogleCalendarService] Search error by phone ${phone}:`, err.message);
      return [];
    }
  }
}
