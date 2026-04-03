import { dbPool } from "../../config/db";
import { OrderRepository } from "./order.repository";
import { queueEvent } from "../../config/queue";
import { logger } from "../../config/logger";

export class OrderService {
  private repository = new OrderRepository();

  async fetchOrders(params: any) {
     const page = parseInt(params.page) || 1;
     const limit = parseInt(params.limit) || 10;
     const offset = (page - 1) * limit;
     return await this.repository.getOrders(
         limit,
         offset,
         params.date,
         params.productId ? parseInt(params.productId) : undefined,
         params.sortBy,
         params.sortOrder
     );
  }

  async createOrder(items: { productId: number; quantity: number }[]) {
    // Transaction
    const client = await dbPool.connect();
    
    try {
      await client.query('BEGIN');
      
      let totalPrice = 0;
      const verifiedItems = [];

      // Sort items by product ID to prevent deadlocks when locking multiple rows
      const sortedItems = [...items].sort((a, b) => a.productId - b.productId);

      // Lock Phase (Row-Level Locking) & Verification
      for (const item of sortedItems) {
        // Strict row-level lock using FOR UPDATE
        const res = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [item.productId]);
        if (res.rows.length === 0) {
          throw new Error(`Product not found: ID ${item.productId}`);
        }
        
        const product = res.rows[0];
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Requested: ${item.quantity}, Available: ${product.stock}`);
        }
        
        totalPrice += Number(product.price) * item.quantity;
        verifiedItems.push({
          ...product,
          orderQty: item.quantity
        });
      }

      // Create Order
      const orderRes = await client.query(
        'INSERT INTO orders (total_price, status) VALUES ($1, $2) RETURNING *',
        [totalPrice, 'CONFIRMED']
      );
      const order = orderRes.rows[0];

      // Update Stock and create Order Items
      for (const vItem of verifiedItems) {
        await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [vItem.orderQty, vItem.id]);
        
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
          [order.id, vItem.id, vItem.orderQty, vItem.price]
        );
      }

      await client.query('COMMIT');
      logger.info(`✅ Order ${order.id} processed successfully`);

      // Produce Event for asynchronous processing
      await queueEvent('OrderCreated', { orderId: order.id, totalPrice, items });

      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`❌ Order transaction failed, rolled back.`, error);
      throw error;
    } finally {
      client.release();
    }
  }
}
