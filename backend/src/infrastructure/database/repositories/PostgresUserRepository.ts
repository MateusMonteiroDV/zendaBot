import pool from "../connection.js";
import { User } from "../../../domain/entities/User.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";

export class PostgresUserRepository implements IUserRepository {
  private memoryUsers: Map<string, User> = new Map();

  async findByEmail(email: string): Promise<User | null> {
    for (const u of this.memoryUsers.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }

    try {
      const client = await pool.connect();
      try {
        const res = await client.query("SELECT * FROM user_owner WHERE email = $1", [email]);
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        const user = new User(row.id, row.user_name, row.email, row.user_password, row.created_at);
        this.memoryUsers.set(user.id, user);
        return user;
      } finally {
        client.release();
      }
    } catch {
      return null;
    }
  }

  async findById(id: string): Promise<User | null> {
    if (this.memoryUsers.has(id)) {
      return this.memoryUsers.get(id)!;
    }

    try {
      const client = await pool.connect();
      try {
        const res = await client.query("SELECT * FROM user_owner WHERE id = $1", [id]);
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        const user = new User(row.id, row.user_name, row.email, row.user_password, row.created_at);
        this.memoryUsers.set(user.id, user);
        return user;
      } finally {
        client.release();
      }
    } catch {
      return null;
    }
  }

  async save(user: User): Promise<void> {
    this.memoryUsers.set(user.id, user);

    try {
      const client = await pool.connect();
      try {
        await client.query(
          "INSERT INTO user_owner (id, user_name, email, user_password) VALUES ($1, $2, $3, $4)",
          [user.id, user.name, user.email, user.passwordHash]
        );
      } finally {
        client.release();
      }
    } catch {
      // Memory fallback holds the data
    }
  }

  public setInMemoryUser(user: User): void {
    this.memoryUsers.set(user.id, user);
  }
}
