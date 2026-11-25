import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
<<<<<<< HEAD

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
=======
console.log("DB password loaded:", Boolean(process.env.DB_PASSWORD));
console.log("DB password length:", process.env.DB_PASSWORD?.length);
console.log(">>> Connecting to DB:", process.env.DB_NAME, "on PORT:", process.env.DB_PORT, "USER:", process.env.DB_USER);

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "placemate",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD
});
>>>>>>> 2304e1cf27b174ed8b888798c55b392742339ef6

export default pool;