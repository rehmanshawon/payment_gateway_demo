import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../lib/currency.js";

const gatewayOptions = [
  { code: "mobilebank", name: "Mobile Banking", note: "Shows wallets like bKash, Nagad, Rocket and more" },
  { code: "bkash", name: "bKash", note: "Send users directly toward bKash-enabled flow" },
  { code: "nagad", name: "Nagad", note: "Uses the mobile banking group for sandbox-friendly routing" },
  { code: "rocket", name: "Rocket", note: "Uses the mobile banking group for sandbox-friendly routing" },
  { code: "visacard", name: "Visa", note: "Visa debit and credit cards" },
  { code: "mastercard", name: "Mastercard", note: "Mastercard debit and credit cards" },
  { code: "amexcard", name: "AMEX", note: "American Express cards" },
  { code: "othercard", name: "Other Cards", note: "UnionPay, Nexus, Q Cash and other supported cards" }
];

const initialCustomer = {
  name: "Demo Customer",
  email: "customer@example.com",
  phone: "01700000000",
  address: "House 10, Road 12, Dhanmondi",
  city: "Dhaka",
  postcode: "1209",
  country: "Bangladesh"
};

export function CheckoutPage() {
  const { items, subtotal, shippingFee, total, clearCart } = useCart();
  const [customer, setCustomer] = useState(initialCustomer);
  const [gatewayCode, setGatewayCode] = useState("mobilebank");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const payloadItems = useMemo(
    () => items.map((item) => ({ productId: item.id, quantity: item.quantity })),
    [items]
  );

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const orderResponse = await api.createOrder({
        items: payloadItems,
        customer,
        paymentGateway: gatewayCode
      });

      const paymentResponse = await api.initiatePayment({
        orderId: orderResponse.order.id,
        gatewayCode
      });

      clearCart();
      window.location.href = paymentResponse.gatewayUrl;
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell checkout-layout">
      <form className="checkout-form" onSubmit={handleSubmit}>
        <div className="section-head compact">
          <div>
            <p className="eyebrow">Checkout</p>
            <h1>Customer details and payment preference</h1>
          </div>
        </div>

        <div className="form-grid">
          <label>
            Full name
            <input
              value={customer.name}
              onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={customer.email}
              onChange={(event) => setCustomer({ ...customer, email: event.target.value })}
              required
            />
          </label>
          <label>
            Phone
            <input
              value={customer.phone}
              onChange={(event) => setCustomer({ ...customer, phone: event.target.value })}
              required
            />
          </label>
          <label>
            City
            <input
              value={customer.city}
              onChange={(event) => setCustomer({ ...customer, city: event.target.value })}
              required
            />
          </label>
          <label className="full-span">
            Address
            <input
              value={customer.address}
              onChange={(event) => setCustomer({ ...customer, address: event.target.value })}
              required
            />
          </label>
          <label>
            Post code
            <input
              value={customer.postcode}
              onChange={(event) => setCustomer({ ...customer, postcode: event.target.value })}
              required
            />
          </label>
          <label>
            Country
            <input
              value={customer.country}
              onChange={(event) => setCustomer({ ...customer, country: event.target.value })}
              required
            />
          </label>
        </div>

        <div className="gateway-picker">
          <p className="eyebrow">Choose checkout emphasis</p>
          <div className="gateway-options">
            {gatewayOptions.map((gateway) => (
              <label key={gateway.code} className={`gateway-option ${gatewayCode === gateway.code ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="gatewayCode"
                  value={gateway.code}
                  checked={gatewayCode === gateway.code}
                  onChange={(event) => setGatewayCode(event.target.value)}
                />
                <strong>{gateway.name}</strong>
                <span>{gateway.note}</span>
              </label>
            ))}
          </div>
        </div>

        {error ? <p className="feedback-card error">{error}</p> : null}

        <button className="primary-btn full" disabled={submitting}>
          {submitting ? "Redirecting to payment..." : "Place order and continue"}
        </button>
      </form>

      <aside className="summary-card">
        <p className="eyebrow">Order recap</p>
        {items.map((item) => (
          <div key={item.id} className="summary-line">
            <span>
              {item.title} x {item.quantity}
            </span>
            <strong>{formatCurrency(Number(item.price) * item.quantity)}</strong>
          </div>
        ))}
        <div className="summary-line">
          <span>Subtotal</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        <div className="summary-line">
          <span>Delivery</span>
          <strong>{shippingFee === 0 ? "Free" : formatCurrency(shippingFee)}</strong>
        </div>
        <div className="summary-line total">
          <span>Total</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
      </aside>
    </main>
  );
}
