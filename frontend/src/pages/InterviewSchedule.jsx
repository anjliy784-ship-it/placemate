import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
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

function InterviewSchedule() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStudentId = () => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        return JSON.parse(stored).id || null;
      }
    } catch {
      return null;
    }
    return null;
  };

  const studentId = getStudentId();

  const fetchInterviews = async () => {
    if (!studentId) {
      navigate("/login");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/interviews/student/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setInterviews(data);
      }
    } catch (err) {
      console.error("Error loading interview schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [studentId]);

  // Formats any upcoming date (next week, next month, or next year) with exact weekday and countdown
  const getUpcomingScheduleDetails = (dateStr) => {
    if (!dateStr) {
      return {
        displayDate: "Date Pending TPO Slot Assignment",
        countdown: "Slot Pending",
        badgeBg: "#fef3c7",
        badgeColor: "#b45309",
      };
    }

    const target = new Date(dateStr);
    if (isNaN(target.getTime())) {
      return {
        displayDate: dateStr,
        countdown: "Confirmed",
        badgeBg: "#e0f2fe",
        badgeColor: "#0369a1",
      };
    }

    const displayDate = target.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { displayDate, countdown: "Completed", badgeBg: "#f1f5f9", badgeColor: "#475569" };
    }
    if (diffDays === 0) {
      return { displayDate, countdown: "Today", badgeBg: "#fee2e2", badgeColor: "#b91c1c" };
    }
    if (diffDays === 1) {
      return { displayDate, countdown: "Tomorrow", badgeBg: "#fef3c7", badgeColor: "#b45309" };
    }
    return {
      displayDate,
      countdown: `In ${diffDays} days`,
      badgeBg: "#dcfce7",
      badgeColor: "#15803d",
    };
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
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
          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              width: "100%",
              padding: "10px 16px",
              color: "#ef4444",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            <Icons.Logout />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="pm-main-viewport">
        <header className="pm-topbar" style={{ marginBottom: "24px" }}>
          <div className="pm-topbar-title">
            <h1>Interview Schedule</h1>
            <p>Confirmed recruitment assessments, technical rounds, and upcoming interview dates.</p>
          </div>
          <button
            onClick={fetchInterviews}
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
            ⟳ Refresh Schedule
          </button>
        </header>

        {loading ? (
          <p style={{ color: "#64748b" }}>Loading interview schedule...</p>
        ) : interviews.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🗓️</div>
            <h3 style={{ fontSize: "18px", color: "#0f172a", marginBottom: "8px" }}>No Interviews Scheduled Yet</h3>
            <p style={{ color: "#64748b", maxWidth: "460px", margin: "0 auto 18px auto", fontSize: "14px" }}>
              Once you apply to a placement drive and the TPO shortlists your profile with an interview date, your confirmed slot will appear here automatically.
            </p>
            <Link
              to="/placement-drives"
              style={{
                display: "inline-block",
                padding: "10px 18px",
                background: "#2563eb",
                color: "#fff",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Explore Active Placement Drives
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {interviews.map((item) => {
              const schedule = getUpcomingScheduleDetails(item.interview_date);

              return (
                <div
                  key={item.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "22px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "16px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <h3 style={{ margin: 0, fontSize: "19px", color: "#0f172a" }}>{item.company}</h3>
                      <span
                        style={{
                          background: "#e0e7ff",
                          color: "#3730a3",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        {item.package}
                      </span>
                      <span
                        style={{
                          background: schedule.badgeBg,
                          color: schedule.badgeColor,
                          padding: "3px 10px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: "800",
                        }}
                      >
                        {schedule.countdown}
                      </span>
                    </div>

                    <p style={{ margin: "0 0 10px 0", color: "#475569", fontSize: "14px", fontWeight: "500" }}>
                      Role: {item.role}
                    </p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", color: "#334155", fontSize: "13px" }}>
                      <span>📅 <strong>Interview Date:</strong> {schedule.displayDate}</span>
                      <span>⏰ <strong>Time:</strong> {item.interview_time || "Slot TBA"}</span>
                      <span>💻 <strong>Mode:</strong> {item.interview_mode || item.location}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                    <span
                      style={{
                        background: "#dcfce7",
                        color: "#15803d",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      {item.stage || "Technical Interview"}
                    </span>

                    {item.meeting_link ? (
                      <a
                        href={item.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: "7px 14px",
                          background: "#2563eb",
                          color: "#fff",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                          textDecoration: "none",
                        }}
                      >
                        Join Interview Room ↗
                      </a>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                        Status: {item.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default InterviewSchedule;