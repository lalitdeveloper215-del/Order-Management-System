import { dbPool } from "../../config/db";

export class OrderRepository {
  async getOrders(limit: number, offset: number, date?: string, productId?: number, sortBy: string = "created_at", sortOrder: string = "desc") {
    let selectClause = "SELECT DISTINCT o.*";
    let fromClause = "FROM orders o";
    let whereClause = "WHERE 1=1";
    const values: any[] = [];
    let paramIndex = 1;

    if (productId) {
      fromClause += " JOIN order_items oi ON o.id = oi.order_id";
      whereClause += ` AND oi.product_id = $${paramIndex++}`;
      values.push(productId);
    }

    if (date) {
      whereClause += ` AND DATE(o.created_at) = $${paramIndex++}`;
      values.push(date);
    }

    const sortField = ["created_at", "total_price"].includes(sortBy) ? sortBy : "created_at";
    const order = ["asc", "desc"].includes(sortOrder.toLowerCase()) ? sortOrder : "desc";

    const query = `
      ${selectClause}
      ${fromClause}
      ${whereClause}
      ORDER BY o.${sortField} ${order}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    values.push(limit, offset);

    const result = await dbPool.query(query, values);

    // Count Query
    let countQuery = "SELECT COUNT(DISTINCT o.id) FROM orders o";
    const countValues: any[] = [];
    let countIndex = 1;
    if (productId) {
      countQuery += ` JOIN order_items oi ON o.id = oi.order_id`;
    }
    countQuery += " WHERE 1=1";
    if (date) {
        countQuery += ` AND DATE(o.created_at) = $${countIndex++}`;
        countValues.push(date);
    }
    if (productId) {
        countQuery += ` AND oi.product_id = $${countIndex++}`;
        countValues.push(productId);
    }

    const countResult = await dbPool.query(countQuery, countValues);

    return {
      orders: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  }
}
