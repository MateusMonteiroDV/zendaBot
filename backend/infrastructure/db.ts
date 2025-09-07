import 'dotenv/config'
import { Pool } from 'pg';


const pool = new Pool({
  user: process.env.USER_DATABASE_DEV,
  host: process.env.HOST_DATABASE_DEV,
  database: process.env.DB_DATABASE_DEV,
  password: process.env.PS_DATABASE_DEV,
  port: Number(process.env.PORT_DATABASE_DEV)


})





export default pool
