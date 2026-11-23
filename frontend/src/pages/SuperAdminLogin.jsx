import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SuperAdminLogin.css";

const Icons = {
  Terminal: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  ),
  Key: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5L11 9l-1.5-1.5L8 9 3 14v7h7l5-5 1.5 1.5L18 16l1.5-1.5 1.5 1.5 2-2z"></path>
    </svg>
  )
};

function SuperAdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    adminUsername: "",
    securityKey: "",
    authSecret: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.adminUsername || !formData.securityKey || !formData.authSecret) {
      setErrorMessage("All three authentication tokens are strictly required.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      localStorage.setItem(
        "adminAuth",
        JSON.stringify({
          role: "super_admin",
          username: formData.adminUsername,
          sessionStarted: new Date().toISOString()
        })
      );
      navigate("/student-dashboard");
    }, 600);
  };

  return (
    <div className="sal-auth-wrapper">
      <div className="sal-auth-card">
        <div className="sal-auth-header">
          <div className="sal-logo-badge">
            <Icons.Terminal />
          </div>
          <span className="sal-badge-pill">
            <Icons.Key />
            <span>Root System Console</span>
          </span>
          <h2>Super Administrator Authentication</h2>
          <p>Restricted access for system configuration, university tenant onboarding, and audit logs.</p>
        </div>

        {errorMessage && <div className="sal-error-banner">{errorMessage}</div>}

        <form className="sal-auth-form" onSubmit={handleSubmit}>
          <div className="sal-group">
            <label>Master Username / ID</label>
            <input
              type="text"
              name="adminUsername"
              placeholder="root@placemate.internal"
              value={formData.adminUsername}
              onChange={handleChange}
              required
            />
          </div>

          <div className="sal-group">
            <label>Primary Access Key</label>
            <input
              type="password"
              name="securityKey"
              placeholder="••••••••••••••••"
              value={formData.securityKey}
              onChange={handleChange}
              required
            />
          </div>

          <div className="sal-group">
            <label>2FA Secret / Passphrase</label>
            <input
              type="password"
              name="authSecret"
              placeholder="6-digit authenticator PIN or hardware token"
              value={formData.authSecret}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="sal-submit-btn" disabled={loading}>
            {loading ? "Decrypting Credentials..." : "Authenticate Master Console"}
          </button>
        </form>

        <div className="sal-footer">
          <p>Unauthorized access attempts are monitored and logged with remote IP coordinates.</p>
          <div className="sal-role-switch">
            <Link to="/login">← Choose different portal</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminLogin;