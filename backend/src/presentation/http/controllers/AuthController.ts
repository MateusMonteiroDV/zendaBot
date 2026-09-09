import { Request, Response } from "express";
import { RegisterUserUseCase } from "../../../application/use-cases/auth/RegisterUserUseCase.js";
import { LoginUserUseCase } from "../../../application/use-cases/auth/LoginUserUseCase.js";

export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUserUseCase: LoginUserUseCase
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.registerUserUseCase.execute(req.body);
      res.status(201).json({ token: result.token, user: result.user });
    } catch (err: any) {
      if (err.message === "Email already exists") {
        res.status(400).json({ message: err.message });
        return;
      }
      if (err.message?.includes("Email doesnt include @") || err.statusCode === 400) {
        res.status(400).json({ message: err.message });
        return;
      }
      res.status(500).json({ message: err.message || "Error from the server" });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.loginUserUseCase.execute(req.body);
      res.status(200).json({ token: result.token, user: result.user });
    } catch (err: any) {
      if (
        err.message === "Email doesnt exists" ||
        err.message === "Password is wrong" ||
        err.statusCode === 401
      ) {
        res.status(401).json({ message: err.message });
        return;
      }
      res.status(err.statusCode || 500).json({ message: err.message || "Error from the server" });
    }
  }
}
