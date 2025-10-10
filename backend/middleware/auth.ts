import { container } from "../container";
import { IAuthMiddleware } from "../repository/IAuthMiddleware";
import { Request, Response, NextFunction } from "express";
import { ItokenJWT } from "../repository/ItokenJWT";
import { TokenJWT } from "../infrastructure/tokenJWT";

export class AuthMiddleware implements IAuthMiddleware {
  constructor(private tokenJWT: ItokenJWT) {}
  async auth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res
          .status(401)
          .json({ message: "Authorization token missing or malformed" });
        return;
      }

      const token = authHeader.split(" ")[1];
      const decoded = await this.tokenJWT.decode(token);

      //@ts-ignore
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid or expired token" });
    }
  }
}
