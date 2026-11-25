const { Pool } = require('pg');
require('dotenv').config();

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'placemate',
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
    });

console.log(
  process.env.DATABASE_URL
    ? '>>> Connecting to Cloud Neon DB via DATABASE_URL'
    : `>>> Connecting to Local DB: ${process.env.DB_NAME || 'placemate'}`
);

module.exports = pool;