import { AppError } from "../errors/AppError.js";

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public passwordHash: string,
    public createdAt: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new AppError("Nome do usuário é obrigatório.");
    }
    if (!User.isValidEmail(this.email)) {
      throw new AppError("Email inválido ou não pertence a um domínio permitido.");
    }
  }

  public static isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
