import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <nav>
      <h3>Bienvenido {user?.nombre}</h3>
      <ul>
        {user?.rol === "ADMIN" && <li><Link to="/admin">Panel Admin</Link></li>}
        {user?.rol === "AGENTE" && <li><Link to="/agente">Panel Agente</Link></li>}
        {user?.rol === "CLIENTE" && <li><Link to="/cliente">Panel Cliente</Link></li>}
        <li><button onClick={logout}>Cerrar sesión</button></li>
      </ul>
    </nav>
  );
}
