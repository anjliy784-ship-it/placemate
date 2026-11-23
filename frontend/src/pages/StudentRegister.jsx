import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StudentRegister.css";

function StudentRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    registrationNumber: "",
    branch: "Computer Science & Engineering",
    cgpa: "",
    graduationYear: "2027",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    if (parseFloat(formData.cgpa) < 0 || parseFloat(formData.cgpa) > 10) {
      setErrorMessage("Please enter a valid CGPA between 0.0 and 10.0.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      // Persist the newly registered student profile locally
      const newProfile = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        registrationNumber: formData.registrationNumber,
        branch: formData.branch,
        cgpa: formData.cgpa,
        graduationYear: formData.graduationYear,
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        skills: "React, Node.js, C++",
        resumeUrl: "https://drive.google.com/sample-resume",
      };

      try {
        localStorage.setItem("studentProfile", JSON.stringify(newProfile));
      } catch (err) {
        console.error("Storage error:", err);
      }

      navigate("/student-login");
    }, 600);
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <div className="register-header">
          <div className="register-logo-badge">PM</div>
          <h2>Create Student Account</h2>
          <p>Register your student profile to access placement opportunities.</p>
        </div>

        {errorMessage && <div className="register-error-banner">{errorMessage}</div>}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="register-row">
            <div className="register-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="e.g. Rahul Sharma"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="register-group">
              <label>Registration Number</label>
              <input
                type="text"
                name="registrationNumber"
                placeholder="e.g. 23BCE10452"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="register-row">
            <div className="register-group">
              <label>College Email</label>
              <input
                type="email"
                name="email"
                placeholder="name@vitbhopal.ac.in"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="register-group">
              <label>Contact Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="register-row three-col">
            <div className="register-group">
              <label>Branch / Department</label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
              >
                <option value="Computer Science & Engineering">CSE</option>
                <option value="Electronics & Communication">ECE</option>
                <option value="Mechanical Engineering">MECH</option>
                <option value="Electrical Engineering">EEE</option>
                <option value="Information Technology">IT</option>
              </select>
            </div>
            <div className="register-group">
              <label>Cumulative CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="cgpa"
                placeholder="e.g. 8.85"
                value={formData.cgpa}
                onChange={handleChange}
                required
              />
            </div>
            <div className="register-group">
              <label>Passout Year</label>
              <input
                type="number"
                name="graduationYear"
                placeholder="2027"
                value={formData.graduationYear}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="register-row">
            <div className="register-group">
              <label>Create Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="register-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="register-submit-btn" disabled={loading}>
            {loading ? "Creating Profile..." : "Register Profile"}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account? <Link to="/student-login">Sign in here</Link>
          </p>
          <div className="register-role-switch">
            <Link to="/login">← Choose different portal</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentRegister;