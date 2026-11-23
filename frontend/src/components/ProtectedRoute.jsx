import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  let user = null;

  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    console.error("Failed to parse stored user:", err);
  }

  // 1. If not logged in at all, redirect to role selection
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If a specific role is required, verify permission
  if (requiredRole) {
    // If admin is required, allow 'admin' or 'superadmin' or 'college'
    if (requiredRole === "admin" && user.role !== "admin" && user.role !== "college" && user.role !== "superadmin") {
      return <Navigate to="/student-dashboard" replace />;
    }

    // If student is required, allow students (and admins for testing)
    if (requiredRole === "student" && user.role !== "student" && user.role !== "admin") {
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;