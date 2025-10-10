import { Request, Response, NextFunction } from "express";

export interface IAuthMiddleware {
  auth(req: Request, res: Response, next: NextFunction): Promise<void>;
}
