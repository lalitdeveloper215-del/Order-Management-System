import { Worker, Job } from "bullmq";
import { redisOptions, ORDER_QUEUE_NAME } from "../config/queue";
import { logger } from "../config/logger";

export const startWorker = () => {
  const worker = new Worker(
    ORDER_QUEUE_NAME,
    async (job: Job) => {
      logger.info(`📥 Processing Job ${job.id}: ${job.name}`);
      
      if (job.name === "OrderCreated") {
        const { orderId, totalPrice, items } = job.data;
        // Simulate an asynchronous operation such as calculating shipping, sending an email, or generating an invoice
        logger.info(`🚚 Generating shipping label and dispatching notification for Order #${orderId}`);
        await new Promise(resolve => setTimeout(resolve, 2000)); 
        logger.info(`✅ Notification sent for Order #${orderId}`);
      }

      return { status: "success", timestamp: new Date() };
    },
    { connection: redisOptions }
  );

  worker.on("completed", (job) => {
    logger.info(`🏁 Job ${job.id} completed!`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`❌ Job ${job?.id} failed with error ${err.message}`);
  });

  logger.info("👷‍♂️ Order background worker is running...");
  return worker;
};
