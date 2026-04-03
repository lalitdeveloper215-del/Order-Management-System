import { Request, Response, NextFunction } from "express";
import { OrderService } from "./order.service";
import { z } from "zod";

const orderService = new OrderService();

const CreateOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.number().int().positive(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Order must contain at least one item")
});

export class OrderController {
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await orderService.fetchOrders(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = CreateOrderSchema.parse(req.body);
      const order = await orderService.createOrder(validatedData.items);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }
}
