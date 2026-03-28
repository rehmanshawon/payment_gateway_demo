import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export function Header() {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <span className="brand-mark">BP</span>
        <span>
          <strong>BanglaPay</strong>
          <small>SSLCommerz Demo Store</small>
        </span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/">Shop</NavLink>
        <NavLink to="/cart">Cart</NavLink>
      </nav>

      <Link className="cart-pill" to="/cart">
        Cart <span>{count}</span>
      </Link>
    </header>
  );
}
