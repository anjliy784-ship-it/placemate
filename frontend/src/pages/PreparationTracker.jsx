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

const DEFAULT_MODULES = [
  {
    category: "Data Structures & Algorithms (C++)",
    items: [
      { id: "dsa_1", label: "Arrays, Two Pointers & Sliding Window", done: false },
      { id: "dsa_2", label: "Recursion & Backtracking", done: false },
      { id: "dsa_3", label: "Binary Search & Sorting Algorithms", done: false },
      { id: "dsa_4", label: "Trees, Binary Search Trees & Traversals", done: false },
      { id: "dsa_5", label: "Graphs (BFS, DFS, Dijkstra, Topo Sort)", done: false },
      { id: "dsa_6", label: "Dynamic Programming (1D & 2D Patterns)", done: false },
    ],
  },
  {
    category: "Core Technical Concepts",
    items: [
      { id: "core_1", label: "DBMS: Normalization, ACID Properties, SQL Joins", done: false },
      { id: "core_2", label: "OS: Process Synchronization, Deadlocks, Paging", done: false },
      { id: "core_3", label: "Computer Networks: OSI Layers, TCP/IP, DNS, HTTP/HTTPS", done: false },
      { id: "core_4", label: "OOP Principles: Polymorphism, Inheritance, Encapsulation", done: false },
    ],
  },
  {
    category: "Backend & Systems",
    items: [
      { id: "sys_1", label: "REST API Design, Status Codes & Error Handling", done: false },
      { id: "sys_2", label: "JWT Authentication & Role-Based Access Control", done: false },
      { id: "sys_3", label: "Relational Schema Design & Indexing (PostgreSQL)", done: false },
    ],
  },
  {
    category: "Interview & HR Round",
    items: [
      { id: "hr_1", label: "Elevator Pitch & 'Tell Me About Yourself'", done: false },
      { id: "hr_2", label: "Deep Dive into Resume Projects & Architecture", done: false },
      { id: "hr_3", label: "STAR Technique for Behavioral Scenarios", done: false },
    ],
  },
];

function PreparationTracker() {
  const [modules, setModules] = useState(() => {
    try {
      const saved = localStorage.getItem("placemate_prep_tracker");
      return saved ? JSON.parse(saved) : DEFAULT_MODULES;
    } catch {
      return DEFAULT_MODULES;
    }
  });

  useEffect(() => {
    localStorage.setItem("placemate_prep_tracker", JSON.stringify(modules));
  }, [modules]);

  const toggleItem = (categoryId, itemId) => {
    setModules((prevModules) =>
      prevModules.map((cat) => {
        if (cat.category !== categoryId) return cat;
        return {
          ...cat,
          items: cat.items.map((item) =>
            item.id === itemId ? { ...item, done: !item.done } : item
          ),
        };
      })
    );
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all preparation checklists?")) {
      setModules(DEFAULT_MODULES);
    }
  };

  // Calculations
  const totalTasks = modules.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedTasks = modules.reduce(
    (acc, cat) => acc + cat.items.filter((i) => i.done).length,
    0
  );
  const overallPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

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

      {/* Main Viewport */}
      <main className="pm-main-viewport">
        <header className="pm-topbar" style={{ marginBottom: "24px" }}>
          <div className="pm-topbar-title">
            <h1>Placement Preparation Tracker</h1>
            <p>Track your technical interview readiness, algorithmic topics, and CS core milestones.</p>
          </div>
          <button
            onClick={handleReset}
            style={{
              padding: "8px 14px",
              background: "#f1f5f9",
              color: "#475569",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Reset Progress
          </button>
        </header>

        {/* High-Level Progress Overview Card */}
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "24px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#64748b" }}>
                Readiness Index
              </span>
              <h2 style={{ fontSize: "28px", margin: "4px 0 0 0", color: "#0f172a" }}>
                {overallPercentage}% Ready
              </h2>
            </div>
            <div style={{ textAlign: "right", color: "#64748b", fontSize: "14px", fontWeight: "600" }}>
              {completedTasks} of {totalTasks} Milestones Completed
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: "100%", height: "10px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
            <div
              style={{
                width: `${overallPercentage}%`,
                height: "100%",
                background: overallPercentage === 100 ? "#16a34a" : "#2563eb",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </section>

        {/* Checklists Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {modules.map((category) => {
            const catDone = category.items.filter((i) => i.done).length;
            const catTotal = category.items.length;
            const isFinished = catDone === catTotal;

            return (
              <div
                key={category.category}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>{category.category}</h3>
                  <span
                    style={{
                      background: isFinished ? "#dcfce7" : "#f1f5f9",
                      color: isFinished ? "#15803d" : "#475569",
                      fontSize: "12px",
                      fontWeight: "700",
                      padding: "3px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {catDone}/{catTotal}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {category.items.map((item) => (
                    <label
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontSize: "13px",
                        color: item.done ? "#94a3b8" : "#334155",
                        textDecoration: item.done ? "line-through" : "none",
                        cursor: "pointer",
                        padding: "6px 8px",
                        borderRadius: "6px",
                        background: item.done ? "#f8fafc" : "transparent",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => toggleItem(category.category, item.id)}
                        style={{ cursor: "pointer", accentColor: "#2563eb", width: "16px", height: "16px" }}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default PreparationTracker;