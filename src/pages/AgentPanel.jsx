import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function AgentPanel() {
  const { user, fetchUser, logout } = useAuthStore();

  const handleRefresh = async () => {
    await fetchUser();
  };

  // Aquí podrías conectar endpoints reales (reservas, vuelos, etc.)
  const handleDemoAction = () => {
    console.log("Acción de agente (demo): listar reservas asignadas");
  };

  return (
    <div>
      <h2>Panel de Agente</h2>
      <p>Usuario: {user?.nombre} ({user?.correo})</p>
      <p>Rol: {user?.rol}</p>

      <div>
        <button onClick={handleRefresh}>Refrescar perfil</button>
        <button onClick={handleDemoAction}>Acción demo</button>
        <button onClick={logout}>Cerrar sesión</button>
      </div>

      <hr />

      <ul>
        <li>Reservas pendientes (demo)</li>
        <li>Check-in de pasajeros (demo)</li>
        <li>Atención de reclamos (demo)</li>
      </ul>

      <hr />

      <nav>
        <p>Navegación rápida:</p>
        <ul>
          <li><Link to="/admin">Admin</Link></li>
          <li><Link to="/agente">Agente</Link></li>
          <li><Link to="/cliente">Cliente</Link></li>
        </ul>
      </nav>
    </div>
  );
}
