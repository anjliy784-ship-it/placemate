import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CollegeAdminLogin.css";

const Icons = {
  Building: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <line x1="9" y1="22" x2="9" y2="18"></line>
      <line x1="15" y1="22" x2="15" y2="18"></line>
      <line x1="9" y1="6" x2="9.01" y2="6"></line>
      <line x1="15" y1="6" x2="15.01" y2="6"></line>
      <line x1="9" y1="10" x2="9.01" y2="10"></line>
      <line x1="15" y1="10" x2="15.01" y2="10"></line>
      <line x1="9" y1="14" x2="9.01" y2="14"></line>
      <line x1="15" y1="14" x2="15.01" y2="14"></line>
    </svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  )
};

function CollegeAdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    officialEmail: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.officialEmail || !formData.password) {
      setErrorMessage("Please complete all required administrative credentials.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // Connect to the real backend admin login endpoint
<<<<<<< HEAD
      const response = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:5000") + "") + "") + "") + "/api/admin/login", {
=======
      const response = await fetch("http://localhost:5000/api/admin/login", {
>>>>>>> 2304e1cf27b174ed8b888798c55b392742339ef6
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.officialEmail,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store legitimate session credentials for ProtectedRoute
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Navigate directly to the TPO Placement Console
        navigate("/admin");
      } else {
        setErrorMessage(data.message || "Invalid administrative credentials.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setErrorMessage("Failed to connect to backend authentication server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cal-auth-wrapper">
      <div className="cal-auth-card">
        <div className="cal-auth-header">
          <div className="cal-logo-badge">
            <Icons.Building />
          </div>
          <span className="cal-badge-pill">
            <Icons.Shield />
            <span>Placement Cell Portal</span>
          </span>
          <h2>College Administrator Login</h2>
          <p>Sign in to manage company drives, schedule interviews, and verify candidate eligibility.</p>
        </div>

        {errorMessage && <div className="cal-error-banner">{errorMessage}</div>}

        <form className="cal-auth-form" onSubmit={handleSubmit}>
          <div className="cal-group">
            <label>Official Administrator Email</label>
            <input
              type="email"
              name="officialEmail"
              placeholder="e.g. admin@placemate.com or tpo@vitbhopal.ac.in"
              value={formData.officialEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="cal-group">
            <div className="cal-label-row">
              <label>Password</label>
            </div>
            <input
              type="password"
              name="password"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="cal-submit-btn" disabled={loading}>
            {loading ? "Authenticating Session..." : "Authorize Administrative Access"}
          </button>
        </form>

        <div className="cal-footer">
          <p>Requires authorized placement cell coordinator privileges.</p>
          <div style={{ margin: "10px 0", fontSize: "13px" }}>
            <span>Need to set up a new TPO account? </span>
            <Link to="/college-admin-register" style={{ color: "#2563eb", fontWeight: "600" }}>
              Register Here
            </Link>
          </div>
          <div className="cal-role-switch">
            <Link to="/login">← Choose different portal</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollegeAdminLogin;