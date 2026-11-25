import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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

function PlacementDrives() {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [appliedDriveIds, setAppliedDriveIds] = useState(new Set());
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState({ type: "", text: "" });

  // Search & Tier Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");

  // AI Resume Matcher States
  const [aiResult, setAiResult] = useState(null);
  const [analyzingDriveId, setAnalyzingDriveId] = useState(null);

  const getActiveStudentId = () => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.id || null;
      }
    } catch {
      return null;
    }
    return null;
  };

  const studentId = getActiveStudentId();

  useEffect(() => {
    if (!studentId) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [drivesRes, appliedRes, profileRes] = await Promise.all([
          fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:5000") + "") + "") + "") + "/api/drives"),
          fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:5000") + "") + "") + ""}/api/applications/user/${studentId}`),
          fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:5000") + "") + "") + ""}/api/students/profile/${studentId}`),
        ]);

        if (drivesRes.ok) setDrives(await drivesRes.json());
        if (appliedRes.ok) {
          const appliedData = await appliedRes.json();
          setAppliedDriveIds(new Set(appliedData.map((item) => Number(item.drive_id))));
        }
        if (profileRes.ok) {
          setStudentProfile(await profileRes.json());
        }
      } catch (err) {
        console.error("Error loading placement drives:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, navigate]);

  const handleAnalyzeResume = async (driveId) => {
    setAnalyzingDriveId(driveId);
    setAiResult(null);

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:5000") + "") + "") + "") + "/api/ai/match-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, driveId }),
      });

      const data = await res.json();
      if (res.ok) {
        setAiResult(data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setActionMsg({ type: "error", text: data.message || "Could not analyze resume." });
      }
    } catch (err) {
      setActionMsg({ type: "error", text: "Server connection error while analyzing resume." });
    } finally {
      setAnalyzingDriveId(null);
    }
  };

  const handleApply = async (driveId) => {
    setActionMsg({ type: "", text: "" });
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:5000") + "") + "") + "") + "/api/applications/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, driveId }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionMsg({ type: "success", text: "Application submitted successfully!" });
        setAppliedDriveIds((prev) => new Set([...prev, Number(driveId)]));
      } else {
        setActionMsg({ type: "error", text: data.message || "Failed to submit application." });
      }
    } catch (err) {
      setActionMsg({ type: "error", text: "Server communication error." });
    }
  };

  // Helper to classify package into VIT CDC Tier
  const getTierInfo = (pkgStr, roleStr) => {
    const combined = `${pkgStr} ${roleStr}`.toLowerCase();
    const numericLpa = parseFloat((pkgStr || "0").replace(/[^0-9.]/g, "")) || 0;

    if (combined.includes("marquee") || numericLpa >= 20) {
      return { label: "MARQUEE OFFER", bg: "#fef3c7", color: "#b45309", border: "#fcd34d" };
    }
    if (combined.includes("super dream") || numericLpa >= 10) {
      return { label: "SUPER DREAM", bg: "#ede9fe", color: "#6d28d9", border: "#c4b5fd" };
    }
    return { label: "DREAM OFFER", bg: "#e0f2fe", color: "#0369a1", border: "#7dd3fc" };
  };

  const filteredDrives = drives.filter((drive) => {
    const matchesSearch =
      drive.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.role.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (tierFilter === "ALL") return true;
    const tier = getTierInfo(drive.package, drive.role).label;
    return tier.includes(tierFilter);
  });

  const studentCgpa = parseFloat(studentProfile?.cgpa || 0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="pm-dashboard-wrapper">
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

      <main className="pm-main-viewport">
        <header className="pm-topbar" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="pm-topbar-title">
            <h1>VIT Bhopal CDC — Active Placement Drives</h1>
            <p>
              Verified CGPA: <strong>{studentProfile ? studentCgpa.toFixed(2) : "Loading..."}</strong> •{" "}
              {studentProfile?.resume_url ? (
                <span style={{ color: "#15803d", fontWeight: "600" }}>✓ Resume Active</span>
              ) : (
                <span style={{ color: "#b91c1c", fontWeight: "600" }}>⚠️ Upload Resume in Profile to Apply</span>
              )}
            </p>
          </div>
        </header>

        {/* Search & Tier Filter Bar */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search company or role (e.g. Microsoft, SDE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: "240px",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
            }}
          />
          {["ALL", "MARQUEE", "SUPER DREAM", "DREAM"].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: tierFilter === tier ? "none" : "1px solid #cbd5e1",
                background: tierFilter === tier ? "#0f172a" : "#ffffff",
                color: tierFilter === tier ? "#ffffff" : "#334155",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {tier === "ALL" ? "All Tiers" : tier}
            </button>
          ))}
        </div>

        {/* AI Resume Compatibility Report Card */}
        {aiResult && (
          <div
            style={{
              background: "#ffffff",
              border: "2px solid #2563eb",
              borderRadius: "12px",
              padding: "20px 24px",
              marginBottom: "24px",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase" }}>
                  ✨ AI Resume Compatibility Report
                </span>
                <h3 style={{ margin: "4px 0 0 0", fontSize: "18px", color: "#0f172a" }}>
                  {aiResult.company} — {aiResult.role}
                </h3>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span
                  style={{
                    background: aiResult.matchScore >= 75 ? "#dcfce7" : "#fef3c7",
                    color: aiResult.matchScore >= 75 ? "#15803d" : "#b45309",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    fontWeight: "800",
                    fontSize: "16px",
                  }}
                >
                  {aiResult.matchScore}% Match
                </span>
                <button
                  onClick={() => setAiResult(null)}
                  style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}
                >
                  ✕
                </button>
              </div>
            </div>

            <p style={{ fontSize: "14px", color: "#334155", marginBottom: "14px" }}>{aiResult.recommendation}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <strong style={{ fontSize: "12px", color: "#15803d", display: "block", marginBottom: "6px" }}>
                  ✓ Matched Resume Keywords:
                </strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {aiResult.matchedSkills.map((skill) => (
                    <span
                      key={skill}
                      style={{ background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600" }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <strong style={{ fontSize: "12px", color: "#b91c1c", display: "block", marginBottom: "6px" }}>
                  ⚠️ Recommended Keywords to Add:
                </strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {aiResult.missingSkills.length > 0 ? (
                    aiResult.missingSkills.map((skill) => (
                      <span
                        key={skill}
                        style={{ background: "#fee2e2", color: "#991b1b", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600" }}
                      >
                        + {skill}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: "12px", color: "#64748b" }}>All core keywords present!</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {actionMsg.text && (
          <div
            style={{
              padding: "12px 18px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontWeight: "600",
              background: actionMsg.type === "success" ? "#dcfce7" : "#fee2e2",
              color: actionMsg.type === "success" ? "#15803d" : "#b91c1c",
              border: `1px solid ${actionMsg.type === "success" ? "#86efac" : "#fca5a5"}`,
            }}
          >
            {actionMsg.text}
          </div>
        )}

        {loading ? (
          <p style={{ color: "#64748b" }}>Loading active placement drives...</p>
        ) : filteredDrives.length === 0 ? (
          <p style={{ color: "#64748b" }}>No placement drives match your current filter.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
            {filteredDrives.map((drive) => {
              const hasApplied = appliedDriveIds.has(Number(drive.id));
              const requiredCgpa = parseFloat(drive.min_cgpa || 0);
              const isCgpaEligible = studentCgpa >= requiredCgpa;
              const tier = getTierInfo(drive.package, drive.role);

              return (
                <div
                  key={drive.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "22px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span
                        style={{
                          background: tier.bg,
                          color: tier.color,
                          border: `1px solid ${tier.border}`,
                          fontSize: "10px",
                          fontWeight: "800",
                          padding: "3px 8px",
                          borderRadius: "999px",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {tier.label}
                      </span>

                      <span
                        style={{
                          background: isCgpaEligible ? "#dcfce7" : "#fee2e2",
                          color: isCgpaEligible ? "#15803d" : "#b91c1c",
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "3px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        {isCgpaEligible ? "✓ Eligible" : `✕ Requires ${requiredCgpa} CGPA`}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: "19px", color: "#0f172a" }}>{drive.company}</h3>
                      <span style={{ fontWeight: "800", fontSize: "15px", color: "#0f172a" }}>{drive.package}</span>
                    </div>

                    <p style={{ margin: "0 0 14px 0", color: "#475569", fontWeight: "500", fontSize: "14px" }}>{drive.role}</p>

                    <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.9", marginBottom: "16px", background: "#f8fafc", padding: "10px 12px", borderRadius: "8px" }}>
                      <div>📍 <strong>Location:</strong> {drive.location || "Pan India"}</div>
                      <div>🎓 <strong>Branches:</strong> {drive.eligibility || "All Branches"}</div>
                      <div>📊 <strong>Min CGPA:</strong> {requiredCgpa.toFixed(2)}</div>
                      <div>⏳ <strong>Deadline:</strong> {drive.deadline || "Rolling"}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleAnalyzeResume(drive.id)}
                      disabled={analyzingDriveId === drive.id}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #86efac",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: analyzingDriveId === drive.id ? "wait" : "pointer",
                        background: "#f0fdf4",
                        color: "#15803d",
                      }}
                    >
                      {analyzingDriveId === drive.id ? "Scanning..." : "✨ AI Match"}
                    </button>

                    <button
                      onClick={() => handleApply(drive.id)}
                      disabled={hasApplied || !isCgpaEligible}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: hasApplied || !isCgpaEligible ? "not-allowed" : "pointer",
                        background: hasApplied ? "#16a34a" : !isCgpaEligible ? "#cbd5e1" : "#2563eb",
                        color: !isCgpaEligible ? "#64748b" : "#ffffff",
                      }}
                    >
                      {hasApplied ? "✓ Applied" : !isCgpaEligible ? "CGPA Locked" : "Apply Now"}
                    </button>
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

export default PlacementDrives;