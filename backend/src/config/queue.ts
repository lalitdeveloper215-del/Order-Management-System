import { Queue } from "bullmq";
import { env } from "./env";
import { logger } from "./logger";

export const redisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  tls: env.REDIS_TLS ? {} : undefined,
  maxRetriesPerRequest: null,
};

export const ORDER_QUEUE_NAME = "order-processing-queue";

export const orderQueue = new Queue(ORDER_QUEUE_NAME, {
  connection: redisOptions,
});

export const queueEvent = async (name: string, data: any) => {
  try {
    const job = await orderQueue.add(name, data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
    });
    logger.info(`✅ Job added to queue: ${job.id} - ${name}`);
    return job;
  } catch (error) {
    logger.error(`❌ Failed to add job to queue`, error);
    throw error;
  }
};
