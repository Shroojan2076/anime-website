import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT, 10) || 5432,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function initDB() {
  const query = `
    CREATE TABLE IF NOT EXISTS anime (
      id SERIAL PRIMARY KEY,
      mal_id INT NOT NULL UNIQUE,
      title VARCHAR(500) NOT NULL,
      poster TEXT,
      media_type VARCHAR(50),
      synopsis TEXT,
      episodes INT,
      status VARCHAR(100),
      start_date VARCHAR(50),
      end_date VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      anime_id INT NOT NULL UNIQUE REFERENCES anime(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'plan_to_watch',
      episodes_watched INT DEFAULT 0,
      score DECIMAL(3, 1),
      started_at DATE,
      completed_at DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log("Connected to PostgreSQL and tables verified.");
  } catch (error) {
    console.error("Database connection/initialization error:", error.message);
  }
}

initDB();

export default pool;