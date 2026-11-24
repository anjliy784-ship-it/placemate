import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import "./StudentDashboard.css";

const Icons = {
  Overview: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  ),
  Profile: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Drives: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  ),
  Applications: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
  ),
  Schedule: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  Tracker: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  Announcements: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  ),
};

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const getActiveStudentId = () => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.id || 2;
      }
    } catch {
      // Fallback
    }
    return 2;
  };

  const studentId = getActiveStudentId();

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:5000") + "") + ""}/api/applications/user/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Error fetching applications:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusBadgeClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("shortlist") || s.includes("select") || s.includes("offer")) return "badge-success";
    if (s.includes("reject")) return "badge-danger";
    if (s.includes("review") || s.includes("process")) return "badge-warning";
    return "badge-info";
  };

  return (
    <div className="pm-dashboard-wrapper">
      {/* Sidebar Navigation */}
      <aside className="pm-sidebar">
        <div className="pm-brand">
          <div className="pm-brand-badge">PM</div>
          <div className="pm-brand-text">
            <h2>PlaceMate</h2>
            <span>Student Portal</span>
          </div>
        </div>

        <nav className="pm-nav-menu">
          <NavLink
            to="/student-dashboard"
            className={({ isActive }) => (isActive ? "pm-nav-item active" : "pm-nav-item")}
          >
            <Icons.Overview />
            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/student-profile"
            className={({ isActive }) => (isActive ? "pm-nav-item active" : "pm-nav-item")}
          >
            <Icons.Profile />
            <span>My Profile</span>
          </NavLink>

          <NavLink
            to="/placement-drives"
            className={({ isActive }) => (isActive ? "pm-nav-item active" : "pm-nav-item")}
          >
            <Icons.Drives />
            <span>Placement Drives</span>
          </NavLink>

          <NavLink
            to="/my-applications"
            className={({ isActive }) => (isActive ? "pm-nav-item active" : "pm-nav-item")}
          >
            <Icons.Applications />
            <span>My Applications</span>
          </NavLink>

          <NavLink
            to="/interview-schedule"
            className={({ isActive }) => (isActive ? "pm-nav-item active" : "pm-nav-item")}
          >
            <Icons.Schedule />
            <span>Interview Schedule</span>
          </NavLink>

          <NavLink
            to="/preparation-tracker"
            className={({ isActive }) => (isActive ? "pm-nav-item active" : "pm-nav-item")}
          >
            <Icons.Tracker />
            <span>Preparation Tracker</span>
          </NavLink>

          <NavLink
            to="/announcements"
            className={({ isActive }) => (isActive ? "pm-nav-item active" : "pm-nav-item")}
          >
            <Icons.Announcements />
            <span>Announcements</span>
          </NavLink>

          <NavLink 
            to="/admin" 
            className="pm-nav-item" 
            style={{ color: "#38bdf8", fontWeight: "600" }}
          >
            ⚡ TPO Admin Portal
          </NavLink>
        </nav>

        <div className="pm-sidebar-footer">
          <Link to="/" className="pm-logout-btn">
            <Icons.Logout />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="pm-main-viewport">
        <header className="pm-topbar" style={{ marginBottom: "24px" }}>
          <div className="pm-topbar-title">
            <h1>My Applications</h1>
            <p>Track your real-time recruitment progression across applied companies.</p>
          </div>
          <button
            onClick={fetchApplications}
            style={{
              padding: "8px 16px",
              background: "#0f172a",
              color: "#fff",
              borderRadius: "6px",
              border: "none",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ⟳ Refresh Status
          </button>
        </header>

        <section className="pm-panel">
          {loading ? (
            <p style={{ color: "#64748b" }}>Fetching your live application status...</p>
          ) : applications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ color: "#64748b", marginBottom: "16px" }}>You have not applied to any placement drives yet.</p>
              <Link
                to="/placement-drives"
                style={{
                  padding: "10px 18px",
                  background: "#2563eb",
                  color: "#fff",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Browse Placement Drives
              </Link>
            </div>
          ) : (
            <div className="pm-table-wrapper">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Package</th>
                    <th>Location</th>
                    <th>Applied Date</th>
                    <th>Current Stage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: "600", color: "#0f172a" }}>{app.company}</td>
                      <td>{app.role}</td>
                      <td>{app.package}</td>
                      <td>{app.location}</td>
                      <td>{app.applied_date}</td>
                      <td>
                        <span
                          style={{
                            background: "#f1f5f9",
                            color: "#334155",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {app.stage || "Application Submitted"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                          {app.status || "Applied"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default MyApplications;