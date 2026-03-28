import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../lib/currency.js";

export function CartPage() {
  const { items, subtotal, shippingFee, total, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <main className="page-shell">
        <section className="empty-card">
          <p className="eyebrow">Your cart is empty</p>
          <h1>Pick a few products to test the checkout flow.</h1>
          <Link className="primary-btn" to="/">
            Back to products
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell cart-layout">
      <section className="cart-table">
        <div className="section-head compact">
          <div>
            <p className="eyebrow">Cart</p>
            <h1>Review items before checkout</h1>
          </div>
        </div>

        {items.map((item) => (
          <article key={item.id} className="cart-row">
            <img src={item.image} alt={item.title} />
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <strong>{formatCurrency(item.price)}</strong>
            </div>
            <label className="qty-box">
              Qty
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
              />
            </label>
            <button className="text-btn" onClick={() => removeItem(item.id)}>
              Remove
            </button>
          </article>
        ))}
      </section>

      <aside className="summary-card">
        <p className="eyebrow">Summary</p>
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
        <button className="primary-btn full" onClick={() => navigate("/checkout")}>
          Continue to checkout
        </button>
      </aside>
    </main>
  );
}
