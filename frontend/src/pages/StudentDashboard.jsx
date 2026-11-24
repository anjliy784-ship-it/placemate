import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

// Crisp SVG Icons (No external libraries needed)
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
  Bell: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  ),
};

function StudentDashboard() {
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState({ fullName: "Student" });
  const [stats, setStats] = useState({
    availableDrives: 0,
    appliedDrives: 0,
    shortlisted: 0,
    interviews: 0,
  });

  const getStudentId = () => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        return JSON.parse(stored).id || 2;
      }
    } catch {
      // Fallback
    }
    return 2;
  };

  const studentId = getStudentId();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Student Profile Details
        const profileRes = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:5000") + "") + ""}/api/students/profile/${studentId}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setStudentInfo({ fullName: profileData.full_name || "Student" });
        }

        // 2. Fetch Live Dashboard Metrics
        const statsRes = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:5000") + "") + ""}/api/students/stats/${studentId}`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            availableDrives: statsData.availableDrives || 0,
            appliedDrives: statsData.appliedDrives || 0,
            shortlisted: statsData.shortlisted || 0,
            interviews: statsData.interviews || 0,
          });
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err.message);
      }
    };

    fetchDashboardData();
  }, [studentId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatNumber = (num) => (num < 10 ? `0${num}` : `${num}`);

  const initials = studentInfo.fullName
    ? studentInfo.fullName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ST";

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
            end
            className={({ isActive }) =>
              isActive ? "pm-nav-item active" : "pm-nav-item"
            }
          >
            <Icons.Overview />
            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/student-profile"
            className={({ isActive }) =>
              isActive ? "pm-nav-item active" : "pm-nav-item"
            }
          >
            <Icons.Profile />
            <span>My Profile</span>
          </NavLink>

          <NavLink
            to="/placement-drives"
            className={({ isActive }) =>
              isActive ? "pm-nav-item active" : "pm-nav-item"
            }
          >
            <Icons.Drives />
            <span>Placement Drives</span>
          </NavLink>

          <NavLink
            to="/my-applications"
            className={({ isActive }) =>
              isActive ? "pm-nav-item active" : "pm-nav-item"
            }
          >
            <Icons.Applications />
            <span>My Applications</span>
          </NavLink>

          <NavLink
            to="/interview-schedule"
            className={({ isActive }) =>
              isActive ? "pm-nav-item active" : "pm-nav-item"
            }
          >
            <Icons.Schedule />
            <span>Interview Schedule</span>
          </NavLink>

          <NavLink
            to="/preparation-tracker"
            className={({ isActive }) =>
              isActive ? "pm-nav-item active" : "pm-nav-item"
            }
          >
            <Icons.Tracker />
            <span>Preparation Tracker</span>
          </NavLink>

          <NavLink
            to="/announcements"
            className={({ isActive }) =>
              isActive ? "pm-nav-item active" : "pm-nav-item"
            }
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
          <button
            onClick={handleLogout}
            className="pm-logout-btn"
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

      {/* Main Content Viewport */}
      <main className="pm-main-viewport">
        {/* Top Header */}
        <header className="pm-topbar">
          <div className="pm-topbar-title">
            <h1>Overview</h1>
            <p>Welcome back, track your recruitment status and drive updates.</p>
          </div>

          <div className="pm-topbar-actions">
            <button className="pm-notification-btn" aria-label="Notifications">
              <Icons.Bell />
              <span>Notifications</span>
            </button>
            <div className="pm-user-badge">
              <div className="pm-avatar">{initials}</div>
              <div className="pm-user-details">
                <strong>{studentInfo.fullName}</strong>
                <span>Student</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="pm-dashboard-content">
          {/* Dynamic Key Metrics */}
          <section className="pm-stats-grid">
            <div className="pm-metric-card">
              <span className="pm-metric-label">Available Drives</span>
              <div className="pm-metric-value-row">
                <h2>{formatNumber(stats.availableDrives)}</h2>
                <span className="pm-status-pill green">Open</span>
              </div>
              <p>Active placement drives</p>
            </div>

            <div className="pm-metric-card">
              <span className="pm-metric-label">Applied Drives</span>
              <div className="pm-metric-value-row">
                <h2>{formatNumber(stats.appliedDrives)}</h2>
                <span className="pm-status-pill gray">Submitted</span>
              </div>
              <p>Tracked applications</p>
            </div>

            <div className="pm-metric-card">
              <span className="pm-metric-label">Shortlisted</span>
              <div className="pm-metric-value-row">
                <h2>{formatNumber(stats.shortlisted)}</h2>
                <span className="pm-status-pill amber">In Review</span>
              </div>
              <p>Progressed to next rounds</p>
            </div>

            <div className="pm-metric-card">
              <span className="pm-metric-label">Upcoming Interviews</span>
              <div className="pm-metric-value-row">
                <h2>{formatNumber(stats.interviews)}</h2>
                <span className="pm-status-pill blue">Scheduled</span>
              </div>
              <p>Confirmed rounds</p>
            </div>
          </section>

          {/* Recent Applications Table */}
          <section className="pm-panel">
            <div className="pm-panel-header">
              <div>
                <h2>Recent Applications</h2>
                <p>Status updates for companies you applied to.</p>
              </div>
            </div>
            <div className="pm-table-wrapper">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Position</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold text-slate-900">Google</td>
                    <td>Software Engineer</td>
                    <td>25 Oct 2026</td>
                    <td><span className="badge badge-success">Shortlisted</span></td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-900">Infosys</td>
                    <td>System Engineer</td>
                    <td>22 Oct 2026</td>
                    <td><span className="badge badge-info">Applied</span></td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-900">TCS</td>
                    <td>Developer</td>
                    <td>20 Oct 2026</td>
                    <td><span className="badge badge-warning">Under Review</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Split Section: Interviews & Announcements */}
          <div className="pm-grid-split">
            {/* Interviews */}
            <section className="pm-panel">
              <div className="pm-panel-header">
                <div>
                  <h2>Upcoming Interviews</h2>
                  <p>Check dates and preparation guides.</p>
                </div>
              </div>
              <div className="pm-card-stack">
                <div className="pm-item-card">
                  <div className="pm-item-info">
                    <h3>Google</h3>
                    <p>Software Engineer Round 1</p>
                  </div>
                  <div className="pm-item-meta">
                    <span>28 Oct 2026</span>
                    <strong>10:00 AM</strong>
                  </div>
                  <span className="pm-tag online">Online</span>
                </div>

                <div className="pm-item-card">
                  <div className="pm-item-info">
                    <h3>Infosys</h3>
                    <p>Technical Assessment & Interview</p>
                  </div>
                  <div className="pm-item-meta">
                    <span>30 Oct 2026</span>
                    <strong>02:00 PM</strong>
                  </div>
                  <span className="pm-tag offline">In-Person</span>
                </div>
              </div>
            </section>

            {/* Announcements */}
            <section className="pm-panel">
              <div className="pm-panel-header">
                <div>
                  <h2>Placement Announcements</h2>
                  <p>Important deadlines and recruitment news.</p>
                </div>
              </div>
              <div className="pm-card-stack">
                <div className="pm-notice-card">
                  <div className="pm-notice-head">
                    <span className="pm-notice-badge urgent">Deadline</span>
                    <small>12 Nov 2026</small>
                  </div>
                  <h3>Resume Submission Deadline</h3>
                  <p>Students must update and verify their technical resume links before the portal closes.</p>
                </div>

                <div className="pm-notice-card">
                  <div className="pm-notice-head">
                    <span className="pm-notice-badge">Drive</span>
                    <small>15 Nov 2026</small>
                  </div>
                  <h3>Google Recruitment Drive</h3>
                  <p>Registration window for the winter campus recruitment drive is officially open.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;