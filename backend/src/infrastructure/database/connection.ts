import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  user: process.env.USER_DATABASE_DEV,
  host: process.env.HOST_DATABASE_DEV,
  database: process.env.DB_DATABASE_DEV,
  password: process.env.PS_DATABASE_DEV,
  port: Number(process.env.PORT_DATABASE_DEV || 5432),
});

export default pool;
