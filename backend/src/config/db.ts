import { Pool } from "pg";
import { env } from "./env";
import { logger } from "./logger";

export const dbPool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
});

dbPool.on("error", (err) => {
  logger.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export const checkDbConnection = async () => {
    try {
        const client = await dbPool.connect();
        logger.info("✅ Database connected successfully");
        client.release();
    } catch (error) {
        logger.error("❌ Database connection failed", error);
        throw error;
    }
};
