// src/pages/Login/Login.js

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../../services/api";
import logo from "../../assets/frms-logo.png";

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginApi({
        email: form.email,
        password: form.password,
      });

      // Backend returns (in response.data):
      // {
      //   id,
      //   name,
      //   email,
      //   role,
      //   message
      // }
      const responseData = response.data;

      const loggedInUser = {
        id: responseData.id,
        name: responseData.name,
        email: responseData.email,
        role: responseData.role,
      };

      // Save user to localStorage
      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      // Update App.js authentication state
      onLogin(loggedInUser);

      // Go to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <img
          src={logo}
          alt="FRMS logo"
          className="login-logo"
        />

        <h1 className="login-title">FRMS</h1>

        <p className="login-subtitle">
          Food Resources Management System
        </p>

        <p className="login-tagline">
          Green Leaf Kitchen
        </p>

        <form
          onSubmit={handleSubmit}
          className="login-form"
        >

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <label
            className="login-label"
            htmlFor="email"
          >
            Email
          </label>

          <input
            className="login-input"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="username"
            placeholder="Enter your email"
            disabled={loading}
            required
          />

          <label
            className="login-label"
            htmlFor="password"
          >
            Password
          </label>

          <input
            className="login-input"
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            placeholder="Enter your password"
            disabled={loading}
            required
          />

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

        </form>

        <p className="login-hint">
          Please use your registered account credentials to sign in.
        </p>

        <p className="login-hint">
          Don't have an account?{" "}
          <Link to="/register" className="login-link">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;