import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
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

export default pool;