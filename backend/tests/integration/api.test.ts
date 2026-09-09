import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import { Server } from "http";
import { app } from "../../src/app.js";
import { appContainer } from "../../src/container.js";

describe("API Integration Tests (Express Endpoints)", () => {
  let server: Server;
  let baseUrl: string;
  let authToken: string;
  let testTenantId: string;

  beforeAll(async () => {
    jest.spyOn(appContainer.googleCalendarService, "createEvent").mockImplementation(async (_cfg, input) => ({
      id: "mock_gcal_evt_integration",
      summary: input.summary,
      description: input.description,
      startTime: input.startTime,
      endTime: input.endTime,
      status: "confirmed",
    }));

    jest.spyOn(appContainer.googleCalendarService, "deleteEvent").mockResolvedValue(true);

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address();
        const port = typeof addr === "object" && addr ? addr.port : 5000;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  describe("Authentication Endpoints", () => {
    it("POST /api/auth/register should create user and return 201 with token", async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Clínica Nova Vida",
          email: "api_test_user@novavida.com",
          password: "password12345",
          businessName: "Nova Vida Saúde",
          calendarId: "novavida@calendar.google.com",
        }),
      });

      expect(res.status).toBe(201);
      const data: any = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe("api_test_user@novavida.com");

      authToken = data.token;
      testTenantId = data.user.id;
    });

    it("POST /api/auth/login should authenticate user and return 200 with token", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "api_test_user@novavida.com",
          password: "password12345",
        }),
      });

      expect(res.status).toBe(200);
      const data: any = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe("api_test_user@novavida.com");
    });

    it("POST /api/auth/login should return 401 for incorrect password", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "api_test_user@novavida.com",
          password: "wrongpassword",
        }),
      });

      expect(res.status).toBe(401);
    });
  });

  describe("Scheduling Endpoints", () => {
    it("GET /api/scheduling/:tenantId/slots should return available slots", async () => {
      const res = await fetch(
        `${baseUrl}/api/scheduling/${testTenantId}/slots?date=2026-11-10`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      expect(res.status).toBe(200);
      const data: any = await res.json();
      expect(data.tenantId).toBe(testTenantId);
      expect(Array.isArray(data.slots)).toBe(true);
      expect(data.slots.length).toBeGreaterThan(0);
    });

    it("POST /api/scheduling/:tenantId/book should book appointment and return 201", async () => {
      const res = await fetch(`${baseUrl}/api/scheduling/${testTenantId}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          clientName: "Renata Costa",
          clientPhone: "5511988884444",
          clientEmail: "renata@email.com",
          startTime: "2026-11-10T10:00:00.000Z",
          serviceName: "Consulta Geral",
        }),
      });

      expect(res.status).toBe(201);
      const data: any = await res.json();
      expect(data.message).toContain("Consulta agendada com sucesso");
      expect(data.appointment.clientName).toBe("Renata Costa");
    });

    it("GET /api/scheduling/:tenantId/appointments should list client appointments", async () => {
      const res = await fetch(
        `${baseUrl}/api/scheduling/${testTenantId}/appointments?phone=5511988884444`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      expect(res.status).toBe(200);
      const data: any = await res.json();
      expect(Array.isArray(data.appointments)).toBe(true);
      expect(data.appointments.length).toBeGreaterThan(0);
      expect(data.appointments[0].clientPhone).toBe("5511988884444");
    });

    it("POST /api/scheduling/:tenantId/cancel should cancel appointment", async () => {
      const res = await fetch(`${baseUrl}/api/scheduling/${testTenantId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          clientPhone: "5511988884444",
        }),
      });

      expect(res.status).toBe(200);
      const data: any = await res.json();
      expect(data.message).toContain("Consulta cancelada com sucesso");
    });
    it("GET /api/scheduling/:tenantId/config should return tenant calendar config", async () => {
      const res = await fetch(`${baseUrl}/api/scheduling/${testTenantId}/config`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(200);
      const data: any = await res.json();
      expect(data.calendarId).toBeDefined();
    });
  });

  describe("WhatsApp Webhook Endpoint", () => {
    it("POST /api/whatsapp/webhook/:tenantId should process incoming message and return 200", async () => {
      const res = await fetch(`${baseUrl}/api/whatsapp/webhook/${testTenantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: { remoteJid: "5511988885555@s.whatsapp.net", fromMe: false },
          pushName: "Gabriel",
          message: { conversation: "Olá! Quais os horários livres amanhã?" },
        }),
      });

      expect(res.status).toBe(200);
      const data: any = await res.json();
      expect(data.status).toBe("processed");
      expect(data.reply).toBeDefined();
    });

    it("POST /api/whatsapp/:tenantId/disconnect should disconnect session", async () => {
      const res = await fetch(`${baseUrl}/api/whatsapp/${testTenantId}/disconnect`, {
        method: "POST",
      });
      expect(res.status).toBe(200);
    });
  });
});
