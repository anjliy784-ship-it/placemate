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

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:5000") + "") + "/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

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
          <NavLink to="/student-dashboard" className={({ isActive }) => (isActive ? "pm-nav-item active" : "pm-nav-item")}>
            <Icons.Overview />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/student-profile" className={({ isActive }) => (isActive ? "pm-nav-item active" : "pm-nav-item")}>
            <Icons.Profile />
            <span>My Profile</span>
          </NavLink>
          <NavLink to="/placement-drives" className={({ isActive }) => (isActive ? "pm-nav-item active" : "pm-nav-item")}>
            <Icons.Drives />
            <span>Placement Drives</span>
          </NavLink>
          <NavLink to="/my-applications" className={({ isActive }) => (isActive ? "pm-nav-item active" : "pm-nav-item")}>
            <Icons.Applications />
            <span>My Applications</span>
          </NavLink>
          <NavLink to="/interview-schedule" className={({ isActive }) => (isActive ? "pm-nav-item active" : "pm-nav-item")}>
            <Icons.Schedule />
            <span>Interview Schedule</span>
          </NavLink>
          <NavLink to="/preparation-tracker" className={({ isActive }) => (isActive ? "pm-nav-item active" : "pm-nav-item")}>
            <Icons.Tracker />
            <span>Preparation Tracker</span>
          </NavLink>
          <NavLink to="/announcements" className={({ isActive }) => (isActive ? "pm-nav-item active" : "pm-nav-item")}>
            <Icons.Announcements />
            <span>Announcements</span>
          </NavLink>
        </nav>

        <div className="pm-sidebar-footer">
          <Link to="/" className="pm-logout-btn">
            <Icons.Logout />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pm-main-viewport">
        <header className="pm-topbar" style={{ marginBottom: "24px" }}>
          <div className="pm-topbar-title">
            <h1>Official Placement Notices</h1>
            <p>Direct updates, company circulars, and announcements from the Placement Cell.</p>
          </div>
          <button
            onClick={fetchNotices}
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
            ⟳ Refresh Notices
          </button>
        </header>

        {loading ? (
          <p style={{ color: "#64748b" }}>Loading announcements from database...</p>
        ) : announcements.length === 0 ? (
          <p style={{ color: "#64748b" }}>No active announcements at this time.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {announcements.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#ffffff",
                  border: item.is_urgent ? "1px solid #fca5a5" : "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "20px 24px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                  position: "relative",
                  borderLeft: item.is_urgent ? "6px solid #ef4444" : "6px solid #2563eb",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <span
                      style={{
                        background: item.is_urgent ? "#fee2e2" : "#f1f5f9",
                        color: item.is_urgent ? "#b91c1c" : "#334155",
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.category}
                    </span>
                    <h3 style={{ margin: "8px 0 4px 0", fontSize: "17px", color: "#0f172a" }}>
                      {item.title}
                    </h3>
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>
                    📅 {item.posted_date}
                  </span>
                </div>

                <p style={{ margin: 0, color: "#475569", fontSize: "14px", lineHeight: "1.6" }}>
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Announcements;