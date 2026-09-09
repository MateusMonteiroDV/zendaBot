import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { GoogleCalendarService } from "../../src/infrastructure/external/google/GoogleCalendarService.js";
import { TenantGoogleCalendarConfig } from "../../src/domain/entities/Tenant.js";

describe("GoogleCalendarService Tests", () => {
  let service: GoogleCalendarService;
  let mockConfig: TenantGoogleCalendarConfig;
  let mockListEvents: jest.Mock<any>;
  let mockInsertEvent: jest.Mock<any>;
  let mockDeleteEvent: jest.Mock<any>;

  beforeEach(() => {
    service = new GoogleCalendarService();
    mockConfig = {
      calendarId: "clinic_123@group.calendar.google.com",
      timeZone: "America/Sao_Paulo",
      businessHoursStart: "08:00",
      businessHoursEnd: "12:00",
      appointmentDurationMinutes: 60,
    };

    mockListEvents = jest.fn();
    mockInsertEvent = jest.fn();
    mockDeleteEvent = jest.fn();

    // Mock getClient to return our fake calendar methods
    jest.spyOn(service, "getClient").mockReturnValue({
      events: {
        list: mockListEvents,
        insert: mockInsertEvent,
        delete: mockDeleteEvent,
      },
    } as any);
  });

  describe("getAvailableSlots", () => {
    it("should calculate correct slots and mark conflicts as unavailable", async () => {
      const date = "2026-10-15";

      // Mock an existing event from 09:00 to 10:00
      mockListEvents.mockResolvedValue({
        data: {
          items: [
            {
              id: "existing_evt_1",
              status: "confirmed",
              start: { dateTime: `${date}T09:00:00-03:00` },
              end: { dateTime: `${date}T10:00:00-03:00` },
            },
          ],
        },
      });

      const slots = await service.getAvailableSlots(mockConfig, date);

      // Business hours 08:00 to 12:00 with 60 min slots -> 4 slots
      expect(slots.length).toBe(4);

      // Slot 08:00 - 09:00 should be available
      expect(slots[0].available).toBe(true);

      // Slot 09:00 - 10:00 should be UNAVAILABLE due to conflict
      expect(slots[1].available).toBe(false);

      // Slots 10:00 - 11:00 and 11:00 - 12:00 should be available
      expect(slots[2].available).toBe(true);
      expect(slots[3].available).toBe(true);
    });

    it("should ignore cancelled events when checking conflicts", async () => {
      const date = "2026-10-15";

      mockListEvents.mockResolvedValue({
        data: {
          items: [
            {
              id: "cancelled_evt_1",
              status: "cancelled",
              start: { dateTime: `${date}T09:00:00-03:00` },
              end: { dateTime: `${date}T10:00:00-03:00` },
            },
          ],
        },
      });

      const slots = await service.getAvailableSlots(mockConfig, date);
      expect(slots.length).toBe(4);
      expect(slots.every((s) => s.available)).toBe(true);
    });
  });

  describe("createEvent", () => {
    it("should call calendar.events.insert and return created event data", async () => {
      mockInsertEvent.mockResolvedValue({
        data: {
          id: "gcal_event_created_99",
          summary: "Consulta - Carlos",
          description: "Telefone WhatsApp: 11999999999",
          start: { dateTime: "2026-10-15T10:00:00.000Z" },
          end: { dateTime: "2026-10-15T11:00:00.000Z" },
          status: "confirmed",
        },
      });

      const result = await service.createEvent(mockConfig, {
        summary: "Consulta - Carlos",
        description: "Telefone WhatsApp: 11999999999",
        startTime: "2026-10-15T10:00:00.000Z",
        endTime: "2026-10-15T11:00:00.000Z",
        timeZone: "America/Sao_Paulo",
        attendeeEmail: "carlos@email.com",
      });

      expect(mockInsertEvent).toHaveBeenCalledWith({
        calendarId: mockConfig.calendarId,
        requestBody: {
          summary: "Consulta - Carlos",
          description: "Telefone WhatsApp: 11999999999",
          start: { dateTime: "2026-10-15T10:00:00.000Z", timeZone: "America/Sao_Paulo" },
          end: { dateTime: "2026-10-15T11:00:00.000Z", timeZone: "America/Sao_Paulo" },
          attendees: [{ email: "carlos@email.com" }],
        },
      });

      expect(result.id).toBe("gcal_event_created_99");
      expect(result.summary).toBe("Consulta - Carlos");
      expect(result.status).toBe("confirmed");
    });
  });

  describe("deleteEvent", () => {
    it("should call calendar.events.delete with eventId and return true", async () => {
      mockDeleteEvent.mockResolvedValue({});

      const success = await service.deleteEvent(mockConfig, "gcal_event_to_delete");
      expect(mockDeleteEvent).toHaveBeenCalledWith({
        calendarId: mockConfig.calendarId,
        eventId: "gcal_event_to_delete",
      });
      expect(success).toBe(true);
    });
  });

  describe("findEventsByPhone", () => {
    it("should search events by phone and return formatted list", async () => {
      mockListEvents.mockResolvedValue({
        data: {
          items: [
            {
              id: "gcal_found_1",
              summary: "Consulta - Carlos",
              description: "Telefone: 5511999998888",
              start: { dateTime: "2026-10-16T14:00:00Z" },
              end: { dateTime: "2026-10-16T15:00:00Z" },
              status: "confirmed",
            },
          ],
        },
      });

      const events = await service.findEventsByPhone(mockConfig, "5511999998888");
      expect(events.length).toBe(1);
      expect(events[0].id).toBe("gcal_found_1");
      expect(events[0].summary).toBe("Consulta - Carlos");
    });
  });
});
