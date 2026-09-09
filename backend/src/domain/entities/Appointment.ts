import { AppError } from "../errors/AppError.js";

export type AppointmentStatus = "scheduled" | "cancelled" | "completed";

export class Appointment {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly clientPhone: string,
    public readonly clientName: string,
    public googleEventId: string,
    public startTime: Date,
    public endTime: Date,
    public status: AppointmentStatus = "scheduled",
    public summary: string,
    public description?: string,
    public clientEmail?: string,
    public readonly createdAt: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.tenantId) throw new AppError("tenantId é obrigatório.");
    if (!this.clientPhone) throw new AppError("Telefone do cliente é obrigatório.");
    if (!this.clientName) throw new AppError("Nome do cliente é obrigatório.");
    if (this.endTime <= this.startTime) {
      throw new AppError("Horário final da consulta deve ser posterior ao horário inicial.");
    }
  }

  public cancel(): void {
    this.status = "cancelled";
  }

  public isCancelled(): boolean {
    return this.status === "cancelled";
  }
}
