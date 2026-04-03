import { Request, Response, NextFunction } from "express";
import { ProductService } from "./product.service";
import { z } from "zod";

const productService = new ProductService();

const CreateProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(""),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
});

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await productService.fetchProducts(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = CreateProductSchema.parse(req.body);
      const product = await productService.addProduct(validatedData);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }
}
