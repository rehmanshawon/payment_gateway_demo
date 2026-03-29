import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { formatCurrency } from "../lib/currency.js";
import { useCart } from "../context/CartContext.jsx";

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

      <section className="payments-showcase">
        <div className="section-head compact">
          <div>
            <p className="eyebrow">SSLCommerz hosted checkout</p>
            <h2>Customers choose their payment channel on the official SSLCommerz payment page</h2>
          </div>
        </div>

        <a
          className="ssl-banner-card"
          href="https://www.sslcommerz.com/"
          target="_blank"
          rel="noreferrer"
          aria-label="SSLCommerz official website"
        >
          <img
            src="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-05.png"
            alt="Pay with SSLCommerz"
          />
        </a>
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
