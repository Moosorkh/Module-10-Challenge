import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const { Pool } = pg;
const pool= new Pool({
  host: "localhost",
  user: "postgres",
  database: "employees_db",
    password: process.env.DB_PASSWORD,
  port: 5432,
});
export {pool}