import pool from "./connection.js";

export async function runDatabaseMigrations(retries = 10, delayMs = 2000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS user_owner (
            id VARCHAR(255) PRIMARY KEY,
            user_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            user_password VARCHAR(255) NOT NULL,
            business_name VARCHAR(255),
            calendar_id VARCHAR(255) DEFAULT 'primary',
            timezone VARCHAR(100) DEFAULT 'America/Sao_Paulo',
            business_hours_start VARCHAR(10) DEFAULT '08:00',
            business_hours_end VARCHAR(10) DEFAULT '18:00',
            appointment_duration_minutes INT DEFAULT 30,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS contact_user (
            id VARCHAR(255) PRIMARY KEY,
            id_user VARCHAR(255) REFERENCES user_owner(id) ON DELETE CASCADE,
            phone_number VARCHAR(50) NOT NULL,
            name VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS appointments (
            id VARCHAR(255) PRIMARY KEY,
            tenant_id VARCHAR(255) REFERENCES user_owner(id) ON DELETE CASCADE,
            client_phone VARCHAR(50) NOT NULL,
            client_name VARCHAR(255) NOT NULL,
            google_event_id VARCHAR(255),
            start_time VARCHAR(100) NOT NULL,
            end_time VARCHAR(100) NOT NULL,
            status VARCHAR(50) DEFAULT 'scheduled',
            summary TEXT,
            description TEXT,
            client_email VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log("✅ [Postgres] Database schema migrated successfully");
        return;
      } finally {
        client.release();
      }
    } catch (err: any) {
      if (attempt < retries) {
        console.log(`⏳ [Postgres] Aguardando banco de dados responder (tentativa ${attempt}/${retries})...`);
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        console.warn("⚠️  [Postgres] Migration skipped or database offline:", err.message);
      }
    }
  }
}
