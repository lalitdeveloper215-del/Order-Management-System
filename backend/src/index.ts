import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { checkDbConnection } from "./config/db";
import { logger } from "./config/logger";
import { errorHandler } from "./middleware/errorHandler";
import { productRouter } from "./modules/products/product.routes";
import { orderRouter } from "./modules/orders/order.routes";
import { startWorker } from "./workers/order.worker";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  logger.info(`Incoming ${req.method} ${req.url}`);
  next();
});

// Swagger docs
const swaggerDocument = YAML.load(path.join(__dirname, "../docs/swagger.yml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// App Routes
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

// Centralized Error Handling
app.use(errorHandler);

const bootstrap = async () => {
  try {
    await checkDbConnection();
    
    // Start BullMQ Worker
    startWorker();

    app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    logger.error("❌ Failed to bootstrap application", error);
    process.exit(1);
  }
};

bootstrap();
