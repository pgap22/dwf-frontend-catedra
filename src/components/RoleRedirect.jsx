import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const mapRoleToPath = (rol) => {
  if (rol === "ADMIN") return "/admin";
  if (rol === "AGENTE") return "/agente";
  return "/cliente"; // default CLIENTE
};

export default function RoleRedirect() {
  const { user } = useAuthStore();
  if (!user?.rol) return <Navigate to="/login" />;
  return <Navigate to={mapRoleToPath(user.rol)} />;
}
