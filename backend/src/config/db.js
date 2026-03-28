import mysql from "mysql2/promise";
import { env } from "./env.js";
import { seedProducts } from "../data/seedProducts.js";

let pool;

export function getPool() {
  if (!pool) {
    throw new Error("Database pool has not been initialized yet.");
  }

  return pool;
}

async function seedIfNeeded() {
  const db = getPool();
  const [rows] = await db.query("SELECT COUNT(*) AS count FROM products");

  if (rows[0].count > 0) {
    return;
  }

  for (const product of seedProducts) {
    await db.query(
      `
        INSERT INTO products (slug, title, description, price, image, category, badge)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        product.slug,
        product.title,
        product.description,
        product.price,
        product.image,
        product.category,
        product.badge
      ]
    );
  }
}

export async function initializeDatabase() {
  const adminConnection = await mysql.createConnection({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    multipleStatements: true
  });

  await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${env.dbName}\``);
  await adminConnection.end();

  pool = mysql.createPool({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    waitForConnections: true,
    connectionLimit: 10
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(120) NOT NULL UNIQUE,
      title VARCHAR(180) NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      image VARCHAR(500) NOT NULL,
      category VARCHAR(80) NOT NULL,
      badge VARCHAR(80) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_code VARCHAR(50) NOT NULL UNIQUE,
      customer_name VARCHAR(120) NOT NULL,
      customer_email VARCHAR(150) NOT NULL,
      customer_phone VARCHAR(40) NOT NULL,
      customer_address VARCHAR(255) NOT NULL,
      customer_city VARCHAR(120) NOT NULL,
      customer_postcode VARCHAR(30) NOT NULL,
      customer_country VARCHAR(80) NOT NULL DEFAULT 'Bangladesh',
      payment_gateway VARCHAR(40) NOT NULL,
      payment_status VARCHAR(40) NOT NULL DEFAULT 'pending',
      order_status VARCHAR(40) NOT NULL DEFAULT 'awaiting_payment',
      currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
      subtotal DECIMAL(10, 2) NOT NULL,
      shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
      total_amount DECIMAL(10, 2) NOT NULL,
      ssl_val_id VARCHAR(80) NULL,
      bank_tran_id VARCHAR(120) NULL,
      card_type VARCHAR(120) NULL,
      validation_payload JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      title_snapshot VARCHAR(180) NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL,
      quantity INT NOT NULL,
      line_total DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    )
  `);

  await seedIfNeeded();
}
