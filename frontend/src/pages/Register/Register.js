// src/pages/Register/Register.js

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../../services/api";
import logo from "../../assets/frms-logo.png";
import "../Login/login.css";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Backend's UserRegisterDto only accepts name, email, password.
      // The new account is always created with the "staff" role server-side.
      await registerApi({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setSuccess("Account created successfully! Redirecting to sign in...");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Registration failed. Please try again."
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

          {success && (
            <p className="login-success">
              {success}
            </p>
          )}

          <label
            className="login-label"
            htmlFor="name"
          >
            Full Name
          </label>

          <input
            className="login-input"
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
            placeholder="Enter your full name"
            disabled={loading}
            required
          />

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
            autoComplete="new-password"
            placeholder="Create a password"
            disabled={loading}
            required
          />

          <label
            className="login-label"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </label>

          <input
            className="login-input"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            disabled={loading}
            required
          />

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

        </form>

        <p className="login-hint">
          Already have an account?{" "}
          <Link to="/" className="login-link">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
