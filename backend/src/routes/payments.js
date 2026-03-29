import { Router } from "express";
import { getPool } from "../config/db.js";
import { env } from "../config/env.js";
import { hasSslCredentials, initiateSslPayment, validateSslPayment } from "../services/sslcommerz.js";

const router = Router();
const gatewayCodeMap = {
  mobilebank: "mobilebank",
  bkash: "bkash",
  nagad: "mobilebank",
  rocket: "mobilebank",
  upay: "upay",
  visacard: "visacard",
  mastercard: "mastercard",
  amexcard: "amexcard",
  othercard: "othercard"
};

function frontendResultUrl(status, orderId) {
  return `${env.frontendBaseUrl}/payment-result?status=${encodeURIComponent(status)}&orderId=${encodeURIComponent(orderId)}`;
}

async function findOrderByCode(orderCode) {
  const [[order]] = await getPool().query("SELECT * FROM orders WHERE order_code = ?", [orderCode]);
  return order;
}

async function updateOrderStatus(orderId, updates) {
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) {
    return;
  }

  const clause = fields.map((field) => `${field} = ?`).join(", ");
  await getPool().query(`UPDATE orders SET ${clause} WHERE id = ?`, [...values, orderId]);
}

function buildInitiatePayload(order) {
  const checkoutGatewayCode = gatewayCodeMap[order.payment_gateway] || "mobilebank";

  return new URLSearchParams({
    store_id: env.sslStoreId,
    store_passwd: env.sslStorePassword,
    total_amount: Number(order.total_amount).toFixed(2),
    currency: order.currency,
    tran_id: order.order_code,
    success_url: `${env.publicApiBaseUrl}/api/payments/success`,
    fail_url: `${env.publicApiBaseUrl}/api/payments/fail`,
    cancel_url: `${env.publicApiBaseUrl}/api/payments/cancel`,
    ipn_url: `${env.publicApiBaseUrl}/api/payments/ipn`,
    shipping_method: "Courier",
    product_name: "Bangladesh checkout demo order",
    product_category: "ecommerce",
    product_profile: "general",
    cus_name: order.customer_name,
    cus_email: order.customer_email,
    cus_add1: order.customer_address,
    cus_city: order.customer_city,
    cus_postcode: order.customer_postcode,
    cus_country: order.customer_country,
    cus_phone: order.customer_phone,
    ship_name: order.customer_name,
    ship_add1: order.customer_address,
    ship_city: order.customer_city,
    ship_postcode: order.customer_postcode,
    ship_country: order.customer_country,
    multi_card_name: checkoutGatewayCode,
    value_a: String(order.id)
  });
}

router.post("/initiate", async (req, res, next) => {
  try {
    const orderId = Number(req.body.orderId);
    const gatewayCode = req.body.gatewayCode;

    const [[order]] = await getPool().query("SELECT * FROM orders WHERE id = ?", [orderId]);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (gatewayCode && gatewayCode !== order.payment_gateway) {
      await updateOrderStatus(order.id, { payment_gateway: gatewayCode });
      order.payment_gateway = gatewayCode;
    }

    if (env.paymentMode === "mock" || !hasSslCredentials()) {
      await updateOrderStatus(order.id, {
        payment_status: "demo_pending",
        order_status: "redirected_to_mock_gateway"
      });

      return res.json({
        gatewayUrl: frontendResultUrl("mock", order.id),
        mode: "mock"
      });
    }

    const session = await initiateSslPayment(buildInitiatePayload(order));

    if (!session?.GatewayPageURL) {
      return res.status(502).json({
        message: "SSLCommerz did not return a gateway URL.",
        details: session
      });
    }

    await updateOrderStatus(order.id, {
      payment_status: "gateway_redirected",
      order_status: "awaiting_customer_payment"
    });

    res.json({
      gatewayUrl: session.GatewayPageURL,
      mode: env.paymentMode
    });
  } catch (error) {
    next(error);
  }
});

router.post("/ipn", async (req, res, next) => {
  try {
    const order = await findOrderByCode(req.body.tran_id);

    if (!order) {
      return res.status(404).send("Order not found");
    }

    if (!req.body.val_id || env.paymentMode === "mock" || !hasSslCredentials()) {
      await updateOrderStatus(order.id, {
        payment_status: req.body.status?.toLowerCase() || "ipn_received",
        order_status: "payment_notification_received"
      });

      return res.send("IPN received");
    }

    const validation = await validateSslPayment(req.body.val_id);
    const isValid = String(validation?.status || "").startsWith("VALID");

    await updateOrderStatus(order.id, {
      payment_status: isValid ? "paid" : "failed",
      order_status: isValid ? "confirmed" : "payment_failed",
      ssl_val_id: validation?.val_id || req.body.val_id,
      bank_tran_id: validation?.bank_tran_id || null,
      card_type: validation?.card_type || null,
      validation_payload: JSON.stringify(validation)
    });

    res.send("IPN received");
  } catch (error) {
    next(error);
  }
});

router.post("/success", async (req, res, next) => {
  try {
    const order = await findOrderByCode(req.body.tran_id);

    if (!order) {
      return res.redirect(frontendResultUrl("not-found", "0"));
    }

    if (env.paymentMode === "mock" || !hasSslCredentials() || !req.body.val_id) {
      await updateOrderStatus(order.id, {
        payment_status: "paid",
        order_status: "confirmed"
      });

      return res.redirect(frontendResultUrl("success", order.id));
    }

    const validation = await validateSslPayment(req.body.val_id);
    const isValid = String(validation?.status || "").startsWith("VALID");

    await updateOrderStatus(order.id, {
      payment_status: isValid ? "paid" : "failed",
      order_status: isValid ? "confirmed" : "payment_failed",
      ssl_val_id: validation?.val_id || req.body.val_id,
      bank_tran_id: validation?.bank_tran_id || null,
      card_type: validation?.card_type || null,
      validation_payload: JSON.stringify(validation)
    });

    return res.redirect(frontendResultUrl(isValid ? "success" : "failed", order.id));
  } catch (error) {
    next(error);
  }
});

router.post("/fail", async (req, res, next) => {
  try {
    const order = await findOrderByCode(req.body.tran_id);

    if (order) {
      await updateOrderStatus(order.id, {
        payment_status: "failed",
        order_status: "payment_failed"
      });
      return res.redirect(frontendResultUrl("failed", order.id));
    }

    res.redirect(frontendResultUrl("failed", "0"));
  } catch (error) {
    next(error);
  }
});

router.post("/cancel", async (req, res, next) => {
  try {
    const order = await findOrderByCode(req.body.tran_id);

    if (order) {
      await updateOrderStatus(order.id, {
        payment_status: "cancelled",
        order_status: "cancelled"
      });
      return res.redirect(frontendResultUrl("cancelled", order.id));
    }

    res.redirect(frontendResultUrl("cancelled", "0"));
  } catch (error) {
    next(error);
  }
});

export default router;
