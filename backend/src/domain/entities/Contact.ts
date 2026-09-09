import { AppError } from "../errors/AppError.js";

export class Contact {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public phoneNumber: string,
    public name?: string,
    public readonly createdAt: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.tenantId) throw new AppError("tenantId é obrigatório.");
    if (!this.phoneNumber || this.phoneNumber.replace(/\D/g, "").length < 8) {
      throw new AppError("Número de telefone inválido.");
    }
  }

  public getCleanPhoneNumber(): string {
    return this.phoneNumber.replace(/\D/g, "");
  }
}
