import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Database is optional - only initialize if DATABASE_URL is provided
// The app uses in-memory storage by default
let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
    console.log("✓ Database connected (optional)");
  } catch (error) {
    console.warn("⚠ Database connection failed, using in-memory storage:", error);
  }
} else {
  console.log("ℹ No DATABASE_URL provided, using in-memory storage");
}

export { pool, db };
