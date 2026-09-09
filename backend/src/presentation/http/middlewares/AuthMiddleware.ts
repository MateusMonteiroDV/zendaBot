import { Request, Response, NextFunction } from "express";
import { ITokenService } from "../../../domain/repositories/ISecurityService.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export class AuthMiddleware {
  constructor(private tokenService: ITokenService) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authorization token missing or malformed" });
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = await this.tokenService.decode(token);
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ message: "Invalid or expired token" });
    }
  }
}
