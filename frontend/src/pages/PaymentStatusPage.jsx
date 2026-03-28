import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { formatCurrency } from "../lib/currency.js";

const statusCopy = {
  success: {
    title: "Payment validated",
    body: "The order was confirmed after the SSLCommerz callback validation step."
  },
  failed: {
    title: "Payment failed",
    body: "The gateway returned a failed status. You can go back and try another payment option."
  },
  cancelled: {
    title: "Payment cancelled",
    body: "The checkout session was cancelled before completion."
  },
  mock: {
    title: "Mock payment mode",
    body: "The app is running in demo mode because SSLCommerz sandbox credentials are not configured yet."
  },
  "not-found": {
    title: "Order not found",
    body: "We could not match the payment response to a local order."
  }
};

export function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const status = searchParams.get("status") || "mock";
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId || orderId === "0") {
      return;
    }

    api.getOrder(orderId).then((data) => setOrder(data.order)).catch(() => {});
  }, [orderId]);

  const message = statusCopy[status] || statusCopy.mock;

  return (
    <main className="page-shell">
      <section className="status-card">
        <p className="eyebrow">Payment result</p>
        <h1>{message.title}</h1>
        <p>{message.body}</p>

        {order ? (
          <div className="order-panel">
            <div className="summary-line">
              <span>Order code</span>
              <strong>{order.orderCode}</strong>
            </div>
            <div className="summary-line">
              <span>Payment status</span>
              <strong>{order.paymentStatus}</strong>
            </div>
            <div className="summary-line">
              <span>Total</span>
              <strong>{formatCurrency(order.totalAmount)}</strong>
            </div>
            {order.cardType ? (
              <div className="summary-line">
                <span>Gateway detail</span>
                <strong>{order.cardType}</strong>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="hero-actions">
          <Link className="primary-btn" to="/">
            Continue shopping
          </Link>
          <Link className="ghost-btn" to="/cart">
            Back to cart
          </Link>
        </div>
      </section>
    </main>
  );
}
