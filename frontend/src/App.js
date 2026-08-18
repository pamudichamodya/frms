import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Layout from "./components/Layout";
import Stock from "./pages/Stock/Stock";
import Selling from "./pages/Selling/Selling";
import Waste from "./pages/Waste/Waste";
import Dashboard from "./pages/Dashboard/Dashboard";
import Products from './pages/Products/Products';
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (loggedInUser) => setUser(loggedInUser);
  const handleLogout = () => setUser(null);

  return (
    <BrowserRouter>
      <Routes>
        {/* First page: login. If already logged in, skip straight to the dashboard. */}
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
          }
        />

        {/* Registration page. If already logged in, skip straight to the dashboard. */}
        <Route
          path="/register"
          element={
            user ? <Navigate to="/dashboard" replace /> : <Register />
          }
        />

        {/* Everything below requires a logged-in user; otherwise bounce to login. */}
        <Route
          element={
            user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/selling" element={<Selling />} />
          <Route path="/waste" element={<Waste user={user} />} />
          <Route path="/products" element={<Products />} />
        </Route>

        {/* Unknown paths fall back to the first page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
