import { dbPool } from "../../config/db";

export class ProductRepository {
  async getProducts(limit: number, offset: number, search?: string, minPrice?: number, maxPrice?: number, sortBy: string = "created_at", sortOrder: string = "desc") {
    let query = "SELECT * FROM products WHERE 1=1";
    const values: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND name ILIKE $${paramIndex++}`;
      values.push(`%${search}%`);
    }

    if (minPrice !== undefined) {
      query += ` AND price >= $${paramIndex++}`;
      values.push(minPrice);
    }

    if (maxPrice !== undefined) {
      query += ` AND price <= $${paramIndex++}`;
      values.push(maxPrice);
    }

    // Safely inject sorting avoiding SQL injection
    const validSortFields = ["price", "created_at", "name"];
    const validSortOrders = ["asc", "desc"];
    
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    const order = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder : "desc";

    query += ` ORDER BY ${sortField} ${order} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    const result = await dbPool.query(query, values);

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) FROM products WHERE 1=1";
    const countValues: any[] = [];
    let countIndex = 1;
    if (search) {
        countQuery += ` AND name ILIKE $${countIndex++}`;
        countValues.push(`%${search}%`);
    }
    if (minPrice !== undefined) {
        countQuery += ` AND price >= $${countIndex++}`;
        countValues.push(minPrice);
    }
    if (maxPrice !== undefined) {
        countQuery += ` AND price <= $${countIndex++}`;
        countValues.push(maxPrice);
    }

    const countResult = await dbPool.query(countQuery, countValues);

    return {
      products: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async createProduct(name: string, description: string, price: number, stock: number) {
    const query = `
      INSERT INTO products (name, description, price, stock)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const result = await dbPool.query(query, [name, description, price, stock]);
    return result.rows[0];
  }
}
