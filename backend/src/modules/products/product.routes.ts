import { Router } from "express";
import { ProductController } from "./product.controller";

export const productRouter = Router();

productRouter.get("/", ProductController.getProducts);
productRouter.post("/", ProductController.createProduct);
