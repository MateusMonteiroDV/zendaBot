import jwt from "jsonwebtoken";
import { ITokenService, TokenPayload } from "../../domain/repositories/ISecurityService.js";
import { AppError } from "../../domain/errors/AppError.js";

export class JwtTokenService implements ITokenService {
  private secret: string;

  constructor(secret?: string) {
    this.secret = secret || process.env.JWT_SECRET_KEY || "default_jwt_secret_zenda_bot";
  }

  async encode(payload: TokenPayload): Promise<string> {
    return jwt.sign(payload, this.secret, { expiresIn: "7d" });
  }

  async decode(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return decoded;
    } catch {
      throw new AppError("Invalid or expired token", 401);
    }
  }
}
