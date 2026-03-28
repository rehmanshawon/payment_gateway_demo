import { Router } from "express";
import { getPool } from "../config/db.js";

const router = Router();

function buildOrderCode() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

router.post("/", async (req, res, next) => {
  const { items = [], customer = {}, paymentGateway = "mobilebank" } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "At least one cart item is required." });
  }

  if (!customer.name || !customer.email || !customer.phone || !customer.address || !customer.city || !customer.postcode) {
    return res.status(400).json({ message: "Customer details are incomplete." });
  }

  const db = getPool();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const productIds = [...new Set(items.map((item) => Number(item.productId)).filter(Boolean))];

    if (productIds.length === 0) {
      throw new Error("Invalid cart items were submitted.");
    }

    const [products] = await connection.query(
      `SELECT id, title, price FROM products WHERE id IN (${productIds.map(() => "?").join(", ")})`,
      productIds
    );

    const productMap = new Map(products.map((product) => [product.id, product]));
    const normalizedItems = items.map((item) => {
      const product = productMap.get(Number(item.productId));
      const quantity = Math.max(1, Number(item.quantity || 1));

      if (!product) {
        throw new Error(`Product ${item.productId} does not exist.`);
      }

      return {
        productId: product.id,
        title: product.title,
        unitPrice: Number(product.price),
        quantity,
        lineTotal: Number(product.price) * quantity
      };
    });

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const shippingFee = subtotal >= 3000 ? 0 : 120;
    const totalAmount = subtotal + shippingFee;
    const orderCode = buildOrderCode();

    const [result] = await connection.query(
      `
        INSERT INTO orders (
          order_code,
          customer_name,
          customer_email,
          customer_phone,
          customer_address,
          customer_city,
          customer_postcode,
          customer_country,
          payment_gateway,
          subtotal,
          shipping_fee,
          total_amount
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        orderCode,
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        customer.city,
        customer.postcode,
        customer.country || "Bangladesh",
        paymentGateway,
        subtotal.toFixed(2),
        shippingFee.toFixed(2),
        totalAmount.toFixed(2)
      ]
    );

    for (const item of normalizedItems) {
      await connection.query(
        `
          INSERT INTO order_items (order_id, product_id, title_snapshot, unit_price, quantity, line_total)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          result.insertId,
          item.productId,
          item.title,
          item.unitPrice.toFixed(2),
          item.quantity,
          item.lineTotal.toFixed(2)
        ]
      );
    }

    await connection.commit();

    res.status(201).json({
      order: {
        id: result.insertId,
        orderCode,
        paymentGateway,
        subtotal,
        shippingFee,
        totalAmount
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const orderId = Number(req.params.id);
    const db = getPool();
    const [[order]] = await db.query(
      `
        SELECT
          id,
          order_code AS orderCode,
          customer_name AS customerName,
          customer_email AS customerEmail,
          customer_phone AS customerPhone,
          customer_address AS customerAddress,
          customer_city AS customerCity,
          customer_postcode AS customerPostcode,
          customer_country AS customerCountry,
          payment_gateway AS paymentGateway,
          payment_status AS paymentStatus,
          order_status AS orderStatus,
          subtotal,
          shipping_fee AS shippingFee,
          total_amount AS totalAmount,
          card_type AS cardType,
          created_at AS createdAt
        FROM orders
        WHERE id = ?
      `,
      [orderId]
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const [items] = await db.query(
      `
        SELECT
          product_id AS productId,
          title_snapshot AS title,
          unit_price AS unitPrice,
          quantity,
          line_total AS lineTotal
        FROM order_items
        WHERE order_id = ?
        ORDER BY id ASC
      `,
      [orderId]
    );

    res.json({ order: { ...order, items } });
  } catch (error) {
    next(error);
  }
});

export default router;
