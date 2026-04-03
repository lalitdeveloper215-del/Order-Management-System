import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { PackageSearch, ShoppingCart, PlusCircle, LayoutDashboard } from "lucide-react";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import OrderCreation from "./pages/OrderCreation";
import Dashboard from "./pages/Dashboard";

function AppContent() {
  const location = useLocation();

  return (
    <div className="container">
      <header className="header glass-card">
        <h1>OMS Portal</h1>
        <nav>
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            <LayoutDashboard className="inline-icon" /> Dashboard
          </Link>
          <Link to="/products" className={location.pathname === "/products" ? "active" : ""}>
            <PackageSearch className="inline-icon" /> Products
          </Link>
          <Link to="/orders" className={location.pathname === "/orders" ? "active" : ""}>
            <ShoppingCart className="inline-icon" /> Orders
          </Link>
          <Link to="/create-order" className="btn">
            <PlusCircle size={18} /> New Order
          </Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/create-order" element={<OrderCreation />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
