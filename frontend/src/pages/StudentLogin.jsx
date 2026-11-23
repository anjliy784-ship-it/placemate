import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StudentLogin.css";

function StudentLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [showForgot, setShowForgot] = useState(false);
  const [resetData, setResetData] = useState({ email: "", newPassword: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:5000") + "") + "/api/students/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials.");

      localStorage.setItem("token", data.token);
      localStorage.setItem("studentProfile", JSON.stringify(data.user));
      navigate("/placement-drives");
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:5000") + "") + "/api/students/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resetData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not update password.");

      setMessage({ text: data.message, type: "success" });
      setShowForgot(false);
      setFormData({ email: resetData.email, password: "" });
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Student Login</h2>
        <p className="subtitle">Sign in to your PlaceMate account</p>

        {message.text && (
          <div className={message.type === "error" ? "error-alert" : "success-alert"}>
            {message.text}
          </div>
        )}

        {!showForgot ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="name@vitbhopal.ac.in"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label>Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                    padding: 0,
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="login-form">
            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", color: "#475569" }}>
              Enter your registered email and choose a new password:
            </div>

            <div className="form-group">
              <label>Registered Email</label>
              <input
                type="email"
                placeholder="name@vitbhopal.ac.in"
                value={resetData.email}
                onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={resetData.newPassword}
                onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Updating..." : "Update Password & Return"}
            </button>

            <button
              type="button"
              onClick={() => setShowForgot(false)}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "10px",
                background: "transparent",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Cancel
            </button>
          </form>
        )}

        <p className="register-link">
          Don't have an account? <Link to="/student-register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default StudentLogin;