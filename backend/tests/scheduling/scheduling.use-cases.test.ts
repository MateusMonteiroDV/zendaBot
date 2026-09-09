import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { BookAppointmentUseCase } from "../../src/application/use-cases/scheduling/BookAppointmentUseCase.js";
import { CancelAppointmentUseCase } from "../../src/application/use-cases/scheduling/CancelAppointmentUseCase.js";
import { GetAvailableSlotsUseCase } from "../../src/application/use-cases/scheduling/GetAvailableSlotsUseCase.js";
import { ListAppointmentsUseCase } from "../../src/application/use-cases/scheduling/ListAppointmentsUseCase.js";
import { PostgresTenantRepository } from "../../src/infrastructure/database/repositories/PostgresTenantRepository.js";
import { PostgresAppointmentRepository } from "../../src/infrastructure/database/repositories/PostgresAppointmentRepository.js";
import { IGoogleCalendarService } from "../../src/domain/repositories/IGoogleCalendarService.js";
import { Tenant } from "../../src/domain/entities/Tenant.js";

describe("Scheduling Use Cases Tests", () => {
  let tenantRepo: PostgresTenantRepository;
  let appointmentRepo: PostgresAppointmentRepository;
  let mockGoogleCalendarService: jest.Mocked<IGoogleCalendarService>;

  let bookUseCase: BookAppointmentUseCase;
  let cancelUseCase: CancelAppointmentUseCase;
  let getSlotsUseCase: GetAvailableSlotsUseCase;
  let listUseCase: ListAppointmentsUseCase;

  const testTenantId = "tenant_test_123";

  beforeEach(async () => {
    tenantRepo = new PostgresTenantRepository();
    appointmentRepo = new PostgresAppointmentRepository();

    // Create and seed a test tenant
    const testTenant = new Tenant(
      testTenantId,
      "Clínica Sorriso",
      "contato@sorriso.com",
      "Clínica Sorriso Odontologia",
      {
        calendarId: "sorriso@group.calendar.google.com",
        timeZone: "America/Sao_Paulo",
        businessHoursStart: "08:00",
        businessHoursEnd: "18:00",
        appointmentDurationMinutes: 30,
      }
    );
    await tenantRepo.save(testTenant);

    mockGoogleCalendarService = {
      getClient: jest.fn(),
      getAvailableSlots: jest.fn(),
      createEvent: jest.fn(),
      deleteEvent: jest.fn(),
      findEventsByPhone: jest.fn(),
    } as unknown as jest.Mocked<IGoogleCalendarService>;

    bookUseCase = new BookAppointmentUseCase(
      tenantRepo,
      appointmentRepo,
      mockGoogleCalendarService
    );
    cancelUseCase = new CancelAppointmentUseCase(
      tenantRepo,
      appointmentRepo,
      mockGoogleCalendarService
    );
    getSlotsUseCase = new GetAvailableSlotsUseCase(
      tenantRepo,
      mockGoogleCalendarService
    );
    listUseCase = new ListAppointmentsUseCase(
      tenantRepo,
      appointmentRepo,
      mockGoogleCalendarService
    );
  });

  describe("BookAppointmentUseCase", () => {
    it("should create event on Google Calendar and persist appointment locally", async () => {
      mockGoogleCalendarService.createEvent.mockResolvedValue({
        id: "gcal_event_555",
        summary: "Consulta - Maria Silva",
        description: "Cliente: Maria Silva\nTelefone WhatsApp: 5511988887777",
        startTime: "2026-10-20T10:00:00.000Z",
        endTime: "2026-10-20T10:30:00.000Z",
        status: "confirmed",
      });

      const output = await bookUseCase.execute({
        tenantId: testTenantId,
        clientName: "Maria Silva",
        clientPhone: "5511988887777",
        startTime: "2026-10-20T10:00:00.000Z",
        serviceName: "Limpeza Dental",
      });

      expect(output).toBeDefined();
      expect(output.googleEventId).toBe("gcal_event_555");
      expect(output.clientName).toBe("Maria Silva");
      expect(output.status).toBe("scheduled");

      expect(mockGoogleCalendarService.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({ calendarId: "sorriso@group.calendar.google.com" }),
        expect.objectContaining({
          summary: "Consulta - Maria Silva",
          startTime: "2026-10-20T10:00:00.000Z",
        })
      );

      const savedInDb = await appointmentRepo.findByGoogleEventId("gcal_event_555");
      expect(savedInDb).not.toBeNull();
      expect(savedInDb?.clientPhone).toBe("5511988887777");
    });

    it("should throw error if required parameters are missing", async () => {
      await expect(
        bookUseCase.execute({
          tenantId: "",
          clientName: "Maria",
          clientPhone: "123",
          startTime: "2026-10-20T10:00:00Z",
        })
      ).rejects.toThrow("tenantId é obrigatório.");
    });
  });

  describe("CancelAppointmentUseCase", () => {
    it("should cancel appointment in Google Calendar and mark as cancelled locally", async () => {
      // First book an appointment
      mockGoogleCalendarService.createEvent.mockResolvedValue({
        id: "gcal_cancel_target_1",
        summary: "Consulta - Pedro",
        description: "Telefone: 5511977776666",
        startTime: "2026-10-22T15:00:00.000Z",
        endTime: "2026-10-22T15:30:00.000Z",
        status: "confirmed",
      });

      await bookUseCase.execute({
        tenantId: testTenantId,
        clientName: "Pedro",
        clientPhone: "5511977776666",
        startTime: "2026-10-22T15:00:00.000Z",
      });

      mockGoogleCalendarService.deleteEvent.mockResolvedValue(true);

      const success = await cancelUseCase.execute({
        tenantId: testTenantId,
        eventIdOrPhone: "5511977776666",
      });

      expect(success).toBe(true);
      expect(mockGoogleCalendarService.deleteEvent).toHaveBeenCalledWith(
        expect.anything(),
        "gcal_cancel_target_1"
      );

      const updated = await appointmentRepo.findByGoogleEventId("gcal_cancel_target_1");
      expect(updated?.isCancelled()).toBe(true);
    });
  });

  describe("GetAvailableSlotsUseCase", () => {
    it("should call Google Calendar service with tenant calendar config", async () => {
      mockGoogleCalendarService.getAvailableSlots.mockResolvedValue([
        { startTime: "2026-10-20T08:00:00Z", endTime: "2026-10-20T08:30:00Z", available: true },
        { startTime: "2026-10-20T08:30:00Z", endTime: "2026-10-20T09:00:00Z", available: false },
      ]);

      const slots = await getSlotsUseCase.execute({
        tenantId: testTenantId,
        date: "2026-10-20",
      });

      expect(slots.length).toBe(2);
      expect(mockGoogleCalendarService.getAvailableSlots).toHaveBeenCalledWith(
        expect.objectContaining({ calendarId: "sorriso@group.calendar.google.com" }),
        "2026-10-20"
      );
    });
  });

  describe("ListAppointmentsUseCase", () => {
    it("should list appointments for a client phone", async () => {
      mockGoogleCalendarService.createEvent.mockResolvedValue({
        id: "gcal_list_1",
        summary: "Consulta - Ana",
        description: "Telefone: 5511955554444",
        startTime: "2026-10-25T11:00:00.000Z",
        endTime: "2026-10-25T11:30:00.000Z",
        status: "confirmed",
      });

      await bookUseCase.execute({
        tenantId: testTenantId,
        clientName: "Ana",
        clientPhone: "5511955554444",
        startTime: "2026-10-25T11:00:00.000Z",
      });

      const list = await listUseCase.execute(testTenantId, "5511955554444");
      expect(list.length).toBe(1);
      expect(list[0].clientName).toBe("Ana");
      expect(list[0].googleEventId).toBe("gcal_list_1");
    });
  });
});
