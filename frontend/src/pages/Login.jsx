import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Icons = {
  Student: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
      <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
    </svg>
  ),
  CollegeAdmin: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="3" y1="9" x2="21" y2="9"></line>
      <line x1="9" y1="21" x2="9" y2="9"></line>
    </svg>
  ),
  SuperAdmin: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
      <line x1="6" y1="6" x2="6.01" y2="6"></line>
      <line x1="6" y1="18" x2="6.01" y2="18"></line>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  ),
};

function Login() {
  const navigate = useNavigate();

  const roles = [
    {
      id: "student",
      title: "Student Portal",
      description: "Access verified drives, submit applications, check eligibility, and prepare for interviews.",
      path: "/student-login",
      icon: <Icons.Student />,
      badge: "Placement Candidate",
    },
    {
      id: "college",
      title: "College Placement Cell",
      description: "Coordinate company drives, review departmental eligibility, and track placement metrics.",
      path: "/college-admin-login",
      icon: <Icons.CollegeAdmin />,
      badge: "Institute Admin",
    },
    {
      id: "superadmin",
      title: "System Administrator",
      description: "Manage institutional onboarding, platform security policies, and system-wide audits.",
      path: "/super-admin-login",
      icon: <Icons.SuperAdmin />,
      badge: "Super Admin",
    },
  ];

  return (
    <div className="login-portal-wrapper">
      <header className="login-topbar">
        <Link to="/" className="login-brand">
          <div className="login-logo-badge">PM</div>
          <span className="login-brand-name">PlaceMate</span>
        </Link>
        <Link to="/" className="login-back-link">
          ← Back to Home
        </Link>
      </header>

      <main className="login-content">
        <div className="login-header-text">
          <span className="login-badge-pill">Unified Access Portal</span>
          <h1>Select Your Role to Continue</h1>
          <p>Sign in to your designated workspace to access tools, records, and pipelines.</p>
        </div>

        <div className="login-roles-grid">
          {roles.map((role) => (
            <div
              key={role.id}
              className="role-card"
              onClick={() => navigate(role.path)}
            >
              <div className="role-card-top">
                <div className="role-icon-box">{role.icon}</div>
                <span className="role-badge">{role.badge}</span>
              </div>

              <h3>{role.title}</h3>
              <p>{role.description}</p>

              <div className="role-card-footer">
                <span>Enter Workspace</span>
                <Icons.ArrowRight />
              </div>
            </div>
          ))}
        </div>

        <div className="login-footer-hint">
          <p>
            New student candidate? <Link to="/student-register">Register your profile</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;