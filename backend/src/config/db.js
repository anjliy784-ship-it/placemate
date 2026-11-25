import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "placemate",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD,
    });

console.log(
  process.env.DATABASE_URL
    ? ">>> Connecting to Cloud Neon DB via DATABASE_URL"
    : `>>> Connecting to Local DB: ${process.env.DB_NAME || "placemate"}`
);

export default pool;