import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


import Dashboard from "./pages/Dashboard/Dashboard";

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
