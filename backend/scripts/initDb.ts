import { Client } from "pg";
import { env } from "../src/config/env";
import fs from "fs";
import path from "path";

async function initDb() {
  // First connect to the default 'postgres' database to create 'oms'
  const defaultClient = new Client({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: "postgres", // Default database
  });

  try {
    await defaultClient.connect();
    console.log("Connected to default postgres database.");
    
    // Check if the database already exists
    const res = await defaultClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [env.DB_NAME]);
    
    if (res.rowCount === 0) {
      console.log(`Database '${env.DB_NAME}' does not exist. Creating...`);
      await defaultClient.query(`CREATE DATABASE ${env.DB_NAME}`);
      console.log(`Database '${env.DB_NAME}' created successfully.`);
    } else {
      console.log(`Database '${env.DB_NAME}' already exists.`);
    }
  } catch (err) {
    console.error("Error creating database:", err);
    process.exit(1);
  } finally {
    await defaultClient.end();
  }

  // Next connect to the 'oms' database to run schema
  const omsClient = new Client({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
  });

  try {
    await omsClient.connect();
    console.log(`Connected to '${env.DB_NAME}' database.`);

    const schemaPath = path.join(__dirname, "../db/schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");

    console.log("Applying schema...");
    await omsClient.query(schemaSql);
    console.log("Schema applied successfully.");

    await seedDummyData(omsClient);
  } catch (err) {
    console.error("Error applying schema:", err);
    process.exit(1);
  } finally {
    await omsClient.end();
  }
}

async function seedDummyData(client: Client) {
  // Check if data already exists to avoid duplicate seeding
  const orderCountRes = await client.query("SELECT COUNT(*) FROM orders");
  if (parseInt(orderCountRes.rows[0].count, 10) > 100) {
    console.log("Data already seeded, skipping dummy data generation.");
    return;
  }

  console.log("Generating 1000+ test records...");

  // Generate 50 products
  let productsValues = [];
  for (let i = 1; i <= 50; i++) {
    const price = (Math.random() * 100 + 10).toFixed(2);
    const stock = Math.floor(Math.random() * 500) + 10;
    productsValues.push(`('Bulk Product ${i}', 'Description ${i}', ${price}, ${stock})`);
  }
  const productsQuery = `INSERT INTO products (name, description, price, stock) VALUES ${productsValues.join(", ")} RETURNING id, price`;
  const productsRes = await client.query(productsQuery);
  const products = productsRes.rows;

  // Generate 1500 orders
  let ordersValues = [];
  for (let i = 1; i <= 1500; i++) {
    const status = Math.random() > 0.8 ? 'COMPLETED' : 'PENDING';
    const totalPrice = (Math.random() * 500 + 20).toFixed(2);
    ordersValues.push(`(${totalPrice}, '${status}')`);
  }
  
  const chunk = 500;
  let orderIds = [];
  for (let i = 0; i < ordersValues.length; i += chunk) {
    const chunkValues = ordersValues.slice(i, i + chunk);
    const ordersQuery = `INSERT INTO orders (total_price, status) VALUES ${chunkValues.join(", ")} RETURNING id`;
    const insertedOrders = await client.query(ordersQuery);
    orderIds.push(...insertedOrders.rows.map((r: any) => r.id));
  }

  // Generate 1-2 order items per order
  let orderItemsValues = [];
  for (const orderId of orderIds) {
    const numItems = Math.floor(Math.random() * 2) + 1;
    for(let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      orderItemsValues.push(`(${orderId}, ${product.id}, ${quantity}, ${product.price})`);
    }
  }

  const itemsChunk = 1000;
  for (let i = 0; i < orderItemsValues.length; i += itemsChunk) {
    const chunkValues = orderItemsValues.slice(i, i + itemsChunk);
    await client.query(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ${chunkValues.join(", ")}`);
  }

  console.log(`Inserted ${products.length} products, ${orderIds.length} orders, and ${orderItemsValues.length} order items.`);
}

initDb();
