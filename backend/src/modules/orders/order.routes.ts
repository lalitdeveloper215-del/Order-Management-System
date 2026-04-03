import { Router } from "express";
import { OrderController } from "./order.controller";

export const orderRouter = Router();

orderRouter.get("/", OrderController.getOrders);
orderRouter.post("/", OrderController.createOrder);
