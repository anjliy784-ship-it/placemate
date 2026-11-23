import Announcements from "./pages/Announcements";
import PreparationTracker from "./pages/PreparationTracker";
import InterviewSchedule from "./pages/InterviewSchedule";
import MyApplications from "./pages/MyApplications";
import PlacementDrives from "./pages/PlacementDrives";
import StudentProfile from "./pages/StudentProfile";
import StudentDashboard from "./pages/StudentDashboard";
import StudentRegister from "./pages/StudentRegister";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import CollegeAdminLogin from "./pages/CollegeAdminLogin";
import StudentLogin from "./pages/StudentLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function Home() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">PlaceMate</div>

        <div className="nav-links">
          <a href="/">Home</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="nav-actions">
          <a href="/login">Login</a>
         <button onClick={() => window.location.href = "/student-login"}>Get Started</button>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-label">SMART CAMPUS PLACEMENT PLATFORM</span>
          <h1>
            Bridging Campus Talent with
            <span> Career Opportunities.</span>
          </h1>
          <p>
            PlaceMate connects students, colleges, and recruiters
            through one platform. Discover opportunities, manage
            placements, and take the next step in your career.
          </p>
          <div className="hero-buttons">
            <button onClick={() => window.location.href = "/login"}>Explore Opportunities</button>
            <button>Learn More</button>
          </div>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-heading">
          <span>ABOUT PLACEMATE</span>
          <h2>One Platform. Three Powerful Connections.</h2>
          <p>
            Simplifying campus placements by bringing students,
            colleges, and recruiters together.
          </p>
        </div>

        <div className="about-cards">
          <div className="about-card">
            <h3>For Students</h3>
            <p>
              Discover placement opportunities, check eligibility,
              apply for drives, and track your application progress.
            </p>
          </div>
          <div className="about-card">
            <h3>For Colleges</h3>
            <p>
              Manage students, placement drives, applications,
              interviews, and placement activities in one place.
            </p>
          </div>
          <div className="about-card">
            <h3>For Recruiters</h3>
            <p>
              Connect with talented students and simplify
              your campus recruitment process.
            </p>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="features-heading">
          <span>WHY CHOOSE PLACEMATE</span>
          <h2>Everything You Need for Better Placements.</h2>
          <p>
            A smarter and simpler way to manage the entire
            campus placement journey.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Smart Eligibility</h3>
            <p>
              Quickly identify placement drives that match
              your academic qualifications.
            </p>
          </div>
          <div className="feature-card">
            <h3>Application Tracking</h3>
            <p>
              Keep track of your applications and stay updated
              throughout the recruitment process.
            </p>
          </div>
          <div className="feature-card">
            <h3>Placement Management</h3>
            <p>
              Help colleges organize placement drives,
              applications, and interview schedules.
            </p>
          </div>
          <div className="feature-card">
            <h3>Centralized Platform</h3>
            <p>
              Access important placement information
              through one organized platform.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer" id="contact">
        <div className="footer-content">
          <div className="footer-brand">
            <h2>PlaceMate</h2>
            <p>
              Connecting campus talent with career opportunities
              through smarter placement management.
            </p>
          </div>

          <div className="footer-links">
            <h3>Quick Links</h3>
            <a href="/">Home</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="footer-links">
            <h3>Platform</h3>
            <a href="/login">Student Login</a>
            <a href="/login">College Login</a>
            <a href="/login">Admin Login</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 PlaceMate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/college-admin-login" element={<CollegeAdminLogin />} />
      <Route path="/super-admin-login" element={<SuperAdminLogin />} />
      <Route path="/student-register" element={<StudentRegister />} />

      {/* Protected Student Portal Routes */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-profile"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/placement-drives"
        element={
          <ProtectedRoute requiredRole="student">
            <PlacementDrives />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-applications"
        element={
          <ProtectedRoute requiredRole="student">
            <MyApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview-schedule"
        element={
          <ProtectedRoute requiredRole="student">
            <InterviewSchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/preparation-tracker"
        element={
          <ProtectedRoute requiredRole="student">
            <PreparationTracker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements"
        element={
          <ProtectedRoute requiredRole="student">
            <Announcements />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Portal Route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;