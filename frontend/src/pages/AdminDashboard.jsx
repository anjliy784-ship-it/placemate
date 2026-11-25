import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalDrives: 0,
    totalApplications: 0,
    shortlisted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [driveForm, setDriveForm] = useState({
    company: "",
    role: "",
    package: "",
    location: "Pan India",
    deadline: "",
    eligibility: "ECE, CSE, IT",
    minCgpa: "7.0",
  });
  const [formMsg, setFormMsg] = useState("");

  // Interview Scheduler Modal State
  const [schedulingApp, setSchedulingApp] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    stage: "Technical Interview - Round 1",
    interviewDate: "",
    interviewTime: "10:30 AM IST",
    interviewMode: "Online (Google Meet / Zoom)",
    meetingLink: "",
  });

  // Fetch applicant list and overview metrics
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const appRes = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:5000") + "") + "") + "") + "/api/admin/applications");
      if (appRes.ok) {
        const appData = await appRes.json();
        setApplications(appData);
        setFilteredApps(appData);
      }

      const metricRes = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:5000") + "") + "") + "") + "/api/admin/metrics");
      if (metricRes.ok) {
        const metricData = await metricRes.json();
        setMetrics(metricData);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter applications by search term and status
  useEffect(() => {
    let result = [...applications];

    if (statusFilter !== "all") {
      result = result.filter(
        (app) => (app.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (app) =>
          (app.full_name || "").toLowerCase().includes(q) ||
          (app.company || "").toLowerCase().includes(q) ||
          (app.email || "").toLowerCase().includes(q) ||
          (app.role || "").toLowerCase().includes(q)
      );
    }

    setFilteredApps(result);
  }, [searchTerm, statusFilter, applications]);

  const handleDriveInput = (e) => {
    setDriveForm({ ...driveForm, [e.target.name]: e.target.value });
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    setFormMsg("");

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:5000") + "") + "") + "") + "/api/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(driveForm),
      });

      if (res.ok) {
        setFormMsg("Drive created and published successfully!");
        setDriveForm({
          company: "",
          role: "",
          package: "",
          location: "Pan India",
          deadline: "",
          eligibility: "ECE, CSE, IT",
          minCgpa: "7.0",
        });
        fetchDashboardData();
      } else {
        setFormMsg("Failed to create placement drive.");
      }
    } catch (err) {
      setFormMsg("Server communication error.");
    }
  };

  // Open the Interview Date/Time Scheduler Modal for a specific applicant
  const openSchedulerModal = (app) => {
    setSchedulingApp(app);
    setScheduleForm({
      stage: app.stage && app.stage !== "Aptitude Screening" ? app.stage : "Technical Interview - Round 1",
      interviewDate: app.interview_date || "",
      interviewTime: app.interview_time || "10:30 AM IST",
      interviewMode: app.interview_mode || "Online (Google Meet / Zoom)",
      meetingLink: app.meeting_link || "",
    });
  };

  // Save Shortlist + Exact Upcoming Interview Date/Time/Link
  const handleConfirmSchedule = async (e) => {
    e.preventDefault();
    if (!schedulingApp) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:5000") + "") + "") + ""}/api/admin/applications/${schedulingApp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Shortlisted",
          stage: scheduleForm.stage,
          interviewDate: scheduleForm.interviewDate,
          interviewTime: scheduleForm.interviewTime,
          interviewMode: scheduleForm.interviewMode,
          meetingLink: scheduleForm.meetingLink,
        }),
      });

      if (res.ok) {
        setSchedulingApp(null);
        fetchDashboardData();
      } else {
        alert("Failed to save interview schedule.");
      }
    } catch (err) {
      console.error("Schedule update error:", err.message);
    }
  };

  const handleUpdateStatus = async (appId, newStatus, newStage) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:5000") + "") + "") + ""}/api/admin/applications/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, stage: newStage }),
      });

      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to update applicant:", err.message);
    }
  };

  // Export filtered candidates to CSV
  const handleExportCSV = () => {
    if (filteredApps.length === 0) {
      alert("No candidate records available to export for the current filter.");
      return;
    }

    const headers = [
      "Application ID",
      "Student Name",
      "Email",
      "Department",
      "CGPA",
      "Company",
      "Role",
      "Applied Date",
      "Stage",
      "Interview Date",
      "Interview Time",
      "Status",
      "Resume Link",
    ];

    const rows = filteredApps.map((app) => [
      app.id,
      `"${app.full_name || ""}"`,
      `"${app.email || ""}"`,
      `"${app.department || "ECE"}"`,
      app.cgpa || "7.50",
      `"${app.company || ""}"`,
      `"${app.role || ""}"`,
      `"${app.applied_date || ""}"`,
      `"${app.stage || ""}"`,
      `"${app.interview_date || "Not Scheduled"}"`,
      `"${app.interview_time || ""}"`,
      `"${app.status || "Applied"}"`,
      `"${app.resume_url || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `PlaceMate_Candidates_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="adm-wrapper">
      <header className="adm-header">
        <div>
          <h1>PlaceMate TPO Placement Console</h1>
          <p>Training & Placement Cell Admin Dashboard</p>
        </div>
        <Link to="/student-dashboard" className="adm-switch-btn">
          Switch to Student View
        </Link>
      </header>

      {/* Top Analytics Metrics Cards */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Registered Students</span>
          <h2 style={{ fontSize: "24px", margin: "6px 0 0 0", color: "#0f172a" }}>{metrics.totalStudents}</h2>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Active Drives</span>
          <h2 style={{ fontSize: "24px", margin: "6px 0 0 0", color: "#2563eb" }}>{metrics.totalDrives}</h2>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Total Applications</span>
          <h2 style={{ fontSize: "24px", margin: "6px 0 0 0", color: "#0f172a" }}>{metrics.totalApplications}</h2>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Shortlisted Candidates</span>
          <h2 style={{ fontSize: "24px", margin: "6px 0 0 0", color: "#16a34a" }}>{metrics.shortlisted}</h2>
        </div>
      </section>

      <div className="adm-layout">
        {/* Left Column: Create New Placement Drive */}
        <section className="adm-card adm-form-card">
          <h2>Publish New Recruitment Drive</h2>
          {formMsg && <div className="adm-alert">{formMsg}</div>}
          <form onSubmit={handleCreateDrive} className="adm-form">
            <div className="adm-field">
              <label>Company Name</label>
              <input
                type="text"
                name="company"
                placeholder="e.g. Google India"
                value={driveForm.company}
                onChange={handleDriveInput}
                required
              />
            </div>

            <div className="adm-field">
              <label>Role</label>
              <input
                type="text"
                name="role"
                placeholder="e.g. Software Development Engineer"
                value={driveForm.role}
                onChange={handleDriveInput}
                required
              />
            </div>

            <div className="adm-row-2">
              <div className="adm-field">
                <label>CTC Package</label>
                <input
                  type="text"
                  name="package"
                  placeholder="e.g. 18.5 LPA"
                  value={driveForm.package}
                  onChange={handleDriveInput}
                  required
                />
              </div>
              <div className="adm-field">
                <label>Min CGPA</label>
                <input
                  type="text"
                  name="minCgpa"
                  placeholder="e.g. 7.5"
                  value={driveForm.minCgpa}
                  onChange={handleDriveInput}
                />
              </div>
            </div>

            <div className="adm-row-2">
              <div className="adm-field">
                <label>Eligible Branches</label>
                <input
                  type="text"
                  name="eligibility"
                  value={driveForm.eligibility}
                  onChange={handleDriveInput}
                />
              </div>
              <div className="adm-field">
                <label>Application Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={driveForm.deadline}
                  onChange={handleDriveInput}
                />
              </div>
            </div>

            <button type="submit" className="adm-submit-btn">
              Publish Drive to Students
            </button>
          </form>
        </section>

        {/* Right Column: Manage Applicants */}
        <section className="adm-card adm-table-card">
          <div className="adm-card-header" style={{ flexWrap: "wrap", gap: "10px" }}>
            <h2>Live Student Applicants ({filteredApps.length})</h2>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={handleExportCSV}
                style={{
                  padding: "8px 14px",
                  background: "#16a34a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                📥 Export CSV
              </button>
              <button onClick={fetchDashboardData} className="adm-refresh-btn">
                Refresh
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div style={{ display: "flex", gap: "10px", margin: "14px 0", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search candidate, company, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: "1",
                minWidth: "180px",
                padding: "8px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "13px",
                background: "#ffffff",
              }}
            >
              <option value="all">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <p className="adm-loading">Loading applicants from database...</p>
          ) : filteredApps.length === 0 ? (
            <p className="adm-loading">No candidate records match the filter.</p>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Branch & CGPA</th>
                    <th>Company & Role</th>
                    <th>Resume</th>
                    <th>Stage & Schedule</th>
                    <th>Status Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <strong>{app.full_name}</strong>
                        <div className="adm-subtext">{app.email}</div>
                      </td>
                      <td>
                        <div>{app.department || "ECE"}</div>
                        <small style={{ color: "#64748b" }}>CGPA: {app.cgpa || "7.50"}</small>
                      </td>
                      <td>
                        <strong>{app.company}</strong>
                        <div className="adm-subtext">
                          {app.role} ({app.package})
                        </div>
                      </td>
                      <td>
                        {app.resume_url ? (
                          <a
                            href={app.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#2563eb",
                              fontWeight: "600",
                              fontSize: "12px",
                              textDecoration: "underline",
                            }}
                          >
                            📄 View PDF
                          </a>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                            Not uploaded
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="adm-stage-badge">{app.stage}</span>
                        {app.interview_date && (
                          <div style={{ fontSize: "11px", color: "#15803d", fontWeight: "600", marginTop: "4px" }}>
                            📅 {app.interview_date} • {app.interview_time}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="adm-action-btns" style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          <button
                            className="adm-btn-shortlist"
                            onClick={() => openSchedulerModal(app)}
                          >
                            📅 Schedule
                          </button>
                          <button
                            className="adm-btn-select"
                            onClick={() =>
                              handleUpdateStatus(app.id, "Selected", "Final Offer Issued")
                            }
                          >
                            Select
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(app.id, "Rejected", "Application Archived")
                            }
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              border: "none",
                              background: "#fee2e2",
                              color: "#b91c1c",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Modal: Schedule Exact Upcoming Interview Date & Time */}
      {schedulingApp && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "460px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>
                Shortlist & Schedule Interview
              </h3>
              <button
                onClick={() => setSchedulingApp(null)}
                style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "#475569", marginBottom: "16px" }}>
              Candidate: <strong>{schedulingApp.full_name}</strong> ({schedulingApp.company} — {schedulingApp.role})
            </p>

            <form onSubmit={handleConfirmSchedule} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Interview Round / Stage
                </label>
                <input
                  type="text"
                  value={scheduleForm.stage}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, stage: e.target.value })}
                  required
                  style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Interview Date (Any Upcoming Date)
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.interviewDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interviewDate: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                    Time Slot
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:30 AM IST"
                    value={scheduleForm.interviewTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interviewTime: e.target.value })}
                    required
                    style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Interview Mode / Venue
                </label>
                <input
                  type="text"
                  placeholder="e.g. Online (Google Meet) or AB-1 Auditorium"
                  value={scheduleForm.interviewMode}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, interviewMode: e.target.value })}
                  style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                  Meeting Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={scheduleForm.meetingLink}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
                  style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setSchedulingApp(null)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Confirm & Notify Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;