import bcrypt from "bcrypt";
import { IPasswordHasher } from "../../domain/repositories/ISecurityService.js";

export class BcryptPasswordHasher implements IPasswordHasher {
  private saltRounds = 10;

  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return await bcrypt.hash(password, salt);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
