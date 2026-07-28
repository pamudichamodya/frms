import { NavLink, Outlet } from "react-router-dom";
import logo from "../assets/frms-logo.png";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/stock", label: "Stock", icon: "📦" },
  { to: "/products", label: "Products", icon: "🍱" },
  { to: "/selling", label: "Selling", icon: "💰" },
  { to: "/waste", label: "Waste", icon: "🗑️" },
];

function Layout({ user, onLogout }) {
  return (
    <div className="app-layout">
      {/* ---------- Sidebar ---------- */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="FRMS logo" className="sidebar-logo-img" />
          <div className="sidebar-logo-text">
            <span className="sidebar-title">FRMS</span>
            <span className="sidebar-subtitle">Green Leaf Kitchen</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
            >
              <span className="sidebar-link-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="sidebar-link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-name">{user.name}</span>
            <span className="sidebar-user-role">{user.role}</span>
          </div>
          <button className="logout-button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>

      {/* ---------- Main content ---------- */}
      <div className="app-main">
        <main className="app-content">
          {/* Nested route (Dashboard / Stock / Selling / Waste) renders here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;