import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { formatCurrency } from "../lib/currency.js";
import { useCart } from "../context/CartContext.jsx";

const gatewayHighlights = [
  { title: "bKash", note: "Popular mobile wallet" },
  { title: "Nagad", note: "Fast checkout option" },
  { title: "Rocket", note: "DBBL mobile banking" },
  { title: "Visa & Mastercard", note: "Debit and credit cards" },
  { title: "AMEX & UnionPay", note: "International card support" },
  { title: "Upay & Nexus", note: "Expanded local coverage" }
];

const supportedPaymentMethods = [
  { name: "bKash", short: "bK", tone: "bkash" },
  { name: "Nagad", short: "Ng", tone: "nagad" },
  { name: "Rocket", short: "Rk", tone: "rocket" },
  { name: "Upay", short: "Up", tone: "upay" },
  { name: "Visa", short: "Vi", tone: "visa" },
  { name: "Mastercard", short: "MC", tone: "mastercard" },
  { name: "AMEX", short: "Ax", tone: "amex" },
  { name: "UnionPay", short: "UP", tone: "unionpay" },
  { name: "DBBL Nexus", short: "Nx", tone: "nexus" },
  { name: "Q Cash", short: "Qc", tone: "qcash" }
];

export function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getProducts()
      .then((data) => setProducts(data.products))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleBuyNow(product) {
    addItem(product);
    navigate("/cart");
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Bangladesh payments demo</p>
          <h1>Feature local wallets, cards, and SSLCommerz sandbox checkout in one clean flow.</h1>
          <p className="hero-copy">
            This demo store shows how a merchant landing page, product catalog, cart, and hosted
            checkout can work together using SSLCommerz-supported gateways like bKash, Nagad,
            Rocket, Visa, Mastercard, AMEX, and more.
          </p>
          <div className="hero-actions">
            <Link className="primary-btn" to="/cart">
              View cart
            </Link>
            <a className="ghost-btn" href="#products">
              Explore products
            </a>
          </div>
        </div>

        <div className="hero-card">
          <span className="status-chip">Hosted sandbox checkout</span>
          <p>
            The backend creates a transaction session, redirects to SSLCommerz, and validates the
            returned `val_id` before marking the order as paid.
          </p>
          <ul className="hero-bullets">
            <li>Mobile banking wallets</li>
            <li>Credit and debit cards</li>
            <li>Gateway-specific checkout selection</li>
            <li>MySQL order tracking</li>
          </ul>
        </div>
      </section>

      <section className="gateway-strip">
        {gatewayHighlights.map((gateway) => (
          <article key={gateway.title} className="gateway-card">
            <strong>{gateway.title}</strong>
            <span>{gateway.note}</span>
          </article>
        ))}
      </section>

      <section className="payments-showcase">
        <div className="section-head compact">
          <div>
            <p className="eyebrow">Supported payment methods</p>
            <h2>Show clients the wallet and card coverage they expect from SSLCommerz</h2>
          </div>
        </div>

        <div className="logo-grid">
          {supportedPaymentMethods.map((method) => (
            <article key={method.name} className="logo-card">
              <div className={`logo-badge ${method.tone}`}>{method.short}</div>
              <strong>{method.name}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="section-head" id="products">
        <div>
          <p className="eyebrow">Featured products</p>
          <h2>Minimal catalog for checkout testing</h2>
        </div>
      </section>

      {loading ? <p className="feedback-card">Loading products...</p> : null}
      {error ? <p className="feedback-card error">{error}</p> : null}

      <section className="product-grid">
        {products.map((product) => (
          <article key={product.id} className="product-card">
            <img src={product.image} alt={product.title} />
            <div className="product-meta">
              <div className="product-topline">
                <span>{product.category}</span>
                <span>{product.badge}</span>
              </div>
              <h3>{product.title}</h3>
              <p>{product.description}</p>
            </div>
            <div className="product-footer">
              <strong>{formatCurrency(product.price)}</strong>
              <div className="inline-actions">
                <button className="secondary-btn" onClick={() => addItem(product)}>
                  Add to cart
                </button>
                <button className="primary-btn" onClick={() => handleBuyNow(product)}>
                  Buy now
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
