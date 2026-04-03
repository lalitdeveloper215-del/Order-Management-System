import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.string().transform(Number).default(5432),
  DB_USER: z.string().default("postgres"),
  DB_PASS: z.string().default("tgs@123"),
  DB_NAME: z.string().default("oms"),
  REDIS_HOST: z.string().default("redis-17524.c90.us-east-1-3.ec2.cloud.redislabs.com"),
  REDIS_PORT: z.string().transform(Number).default(17524),
  REDIS_PASSWORD: z.string().default("NgDdbbpxrdkwKNPFzplNKUbUHVj5YsLP"),
  REDIS_TLS: z.string().default("false").transform((v) => v === "true"),
});

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error("❌ Invalid environment variables:", envParsed.error.format());
  process.exit(1);
}

export const env = envParsed.data;
