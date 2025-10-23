import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, token } = useAuthStore();

  if (!token) return <Navigate to="/login" />;

  if (roles.length && user && !roles.includes(user.rol)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
