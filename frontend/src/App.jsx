import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { CartPage } from "./pages/CartPage.jsx";
import { CheckoutPage } from "./pages/CheckoutPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { PaymentStatusPage } from "./pages/PaymentStatusPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="app-shell">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment-result" element={<PaymentStatusPage />} />
          </Routes>
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
