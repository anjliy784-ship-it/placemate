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

function StudentProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    graduationYear: "",
    cgpa: "7.50",
    resumeUrl: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [uploading, setUploading] = useState(false);

  // Integrated AI Analysis State
  const [aiAudit, setAiAudit] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const getStudentId = () => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) return parsed.id;
      }
    } catch {
      // Ignore parse error
    }
    return null;
  };

  const studentId = getStudentId();

  useEffect(() => {
    if (!studentId) {
      setStatusMsg({
        type: "error",
        text: "Session expired or not logged in. Please Sign Out and log in with your student email.",
      });
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/students/profile/${studentId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile({
            fullName: data.full_name || "",
            email: data.email || "",
            phone: data.phone || "",
            department: data.department || "",
            graduationYear: data.graduation_year || "",
            cgpa: data.cgpa || "7.50",
            resumeUrl: data.resume_url || "",
          });

          // Automatically run AI analysis if resume already exists
          if (data.resume_url) {
            runAiResumeAudit(studentId);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    fetchProfile();
  }, [studentId]);

  const runAiResumeAudit = async (idToScan) => {
    setAnalyzing(true);
    try {
      const res = await fetch("http://localhost:5000/api/ai/analyze-profile-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: idToScan }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiAudit(data);
      } else {
        setStatusMsg({ type: "error", text: data.message || "AI scan failed." });
      }
    } catch (err) {
      console.error("AI audit error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!studentId) return;
    setStatusMsg({ type: "", text: "" });

    try {
      const res = await fetch(`http://localhost:5000/api/students/profile/${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: profile.fullName,
          phone: profile.phone,
          department: profile.department,
          graduationYear: profile.graduationYear,
          cgpa: parseFloat(profile.cgpa),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: "success", text: "Profile and CGPA updated successfully!" });
        if (profile.resumeUrl) {
          runAiResumeAudit(studentId); // Re-calculate company eligibility with new CGPA
        }
      } else {
        setStatusMsg({ type: "error", text: data.message || "Failed to save profile." });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: "Server error while updating profile." });
    }
  };

  const handleResumeUpload = async () => {
    if (!studentId) {
      setStatusMsg({ type: "error", text: "Please log in first before uploading a resume." });
      return;
    }
    if (!selectedFile) {
      setStatusMsg({ type: "error", text: "Please choose a PDF file first." });
      return;
    }

    setUploading(true);
    setStatusMsg({ type: "", text: "" });

    const formData = new FormData();
    formData.append("resume", selectedFile);

    try {
      const res = await fetch(`http://localhost:5000/api/students/upload-resume/${studentId}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setProfile((prev) => ({ ...prev, resumeUrl: data.resumeUrl }));
        setStatusMsg({
          type: "success",
          text: "Resume uploaded! Running AI Skill & Interview Eligibility Scan...",
        });
        // Automatically trigger AI Resume Analysis immediately after upload!
        await runAiResumeAudit(studentId);
      } else {
        setStatusMsg({ type: "error", text: data.message || "Resume upload failed." });
      }
    } catch (err) {
      console.error("Upload error:", err);
      setStatusMsg({ type: "error", text: "Failed to connect to server for resume upload." });
    } finally {
      setUploading(false);
    }
  };

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
        <header className="pm-topbar" style={{ marginBottom: "24px" }}>
          <div className="pm-topbar-title">
            <h1>Candidate Profile & AI Resume Analyzer</h1>
            <p>Upload your PDF resume to check your ATS score and see which company interviews you qualify for.</p>
          </div>
        </header>

        {statusMsg.text && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontWeight: "600",
              background: statusMsg.type === "success" ? "#dcfce7" : "#fee2e2",
              color: statusMsg.type === "success" ? "#15803d" : "#b91c1c",
              border: `1px solid ${statusMsg.type === "success" ? "#86efac" : "#fca5a5"}`,
            }}
          >
            {statusMsg.text}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "24px", marginBottom: "24px" }}>
          {/* Left Card: Academic Profile */}
          <div className="pm-panel" style={{ padding: "24px" }}>
            <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "18px" }}>Academic & Personal Information</h2>
            <form onSubmit={handleProfileSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  Institutional Email (Read Only)
                </label>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Phone Number</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="e.g. 9235740684"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={profile.cgpa}
                    onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Branch / Department</label>
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    placeholder="e.g. ECE"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Graduation Year</label>
                  <input
                    type="text"
                    value={profile.graduationYear}
                    onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                    placeholder="e.g. 2029"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  padding: "12px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer",
                  marginTop: "6px",
                }}
              >
                Save Profile Details
              </button>
            </form>
          </div>

          {/* Right Card: Technical Resume + Instant AI Scan Trigger */}
          <div className="pm-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ marginTop: 0, marginBottom: "8px", fontSize: "18px" }}>Technical Resume & AI Scan</h2>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
                Upload your PDF resume. Our AI engine will immediately calculate your ATS score and check interview eligibility across all companies.
              </p>

              {profile.resumeUrl ? (
                <div style={{ background: "#f0fdf4", border: "1px solid #86efac", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
                  <strong style={{ color: "#15803d", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                    ✓ Active Resume Attached
                  </strong>
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#2563eb", fontSize: "13px", fontWeight: "600", textDecoration: "underline" }}
                  >
                    📄 View Uploaded PDF Resume
                  </a>
                </div>
              ) : (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "12px", borderRadius: "8px", marginBottom: "16px", color: "#b91c1c", fontSize: "13px" }}>
                  ⚠️ No resume uploaded yet. You cannot apply to drives without a PDF resume.
                </div>
              )}

              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{ marginBottom: "14px", fontSize: "13px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                type="button"
                onClick={handleResumeUpload}
                disabled={uploading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#0f172a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: uploading ? "wait" : "pointer",
                }}
              >
                {uploading ? "Uploading & Scanning..." : "Upload & Analyze Resume (PDF)"}
              </button>

              {profile.resumeUrl && (
                <button
                  type="button"
                  onClick={() => runAiResumeAudit(studentId)}
                  disabled={analyzing}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    border: "1px solid #93c5fd",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {analyzing ? "Running AI Audit..." : "✨ Re-Run AI Interview Eligibility Scan"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Integrated AI Resume Score & Company Interview Applicability Section */}
        {aiAudit && (
          <section className="pm-panel" style={{ padding: "24px", border: "2px solid #2563eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase" }}>
                  ✨ AI Resume Analysis & Drive Applicability Report
                </span>
                <h2 style={{ margin: "4px 0 0 0", fontSize: "20px" }}>
                  Your ATS Resume Score: <span style={{ color: "#15803d" }}>{aiAudit.overallAtsScore} / 100</span>
                </h2>
              </div>
              <div style={{ textAlign: "right", fontSize: "13px", color: "#475569" }}>
                <strong>Evaluated CGPA:</strong> {aiAudit.studentCgpa}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <strong style={{ fontSize: "13px", color: "#334155", display: "block", marginBottom: "8px" }}>
                Detected Technical Skills in Your Resume:
              </strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {aiAudit.detectedSkills.length > 0 ? (
                  aiAudit.detectedSkills.map((skill) => (
                    <span
                      key={skill}
                      style={{ background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}
                    >
                      ✓ {skill}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "13px", color: "#b91c1c" }}>No standard tech keywords detected. Add clear skill tags to your PDF.</span>
                )}
              </div>
            </div>

            <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Interview Applicability Across Active Companies</h3>
            <div className="pm-table-wrapper">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Package</th>
                    <th>Resume Skill Match</th>
                    <th>Interview Applicability Status</th>
                  </tr>
                </thead>
                <tbody>
                  {aiAudit.driveMatches.map((item) => (
                    <tr key={item.driveId}>
                      <td style={{ fontWeight: "700" }}>{item.company}</td>
                      <td>{item.role}</td>
                      <td>{item.package}</td>
                      <td>
                        <span
                          style={{
                            fontWeight: "700",
                            color: item.skillMatchPct >= 70 ? "#15803d" : "#b45309",
                          }}
                        >
                          {item.skillMatchPct}% Match
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background: item.isApplicable ? "#dcfce7" : "#fee2e2",
                            color: item.isApplicable ? "#15803d" : "#b91c1c",
                          }}
                        >
                          {item.isApplicable ? `✓ ${item.verdict}` : `✕ ${item.verdict}`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default StudentProfile;