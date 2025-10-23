import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ClientPanel() {
  const { user, fetchUser, logout } = useAuthStore();

  const handleRefresh = async () => {
    await fetchUser();
  };

  // Aquí podrías consultar vuelos, crear reservas, etc.
  const handleDemoAction = () => {
    console.log("Acción de cliente (demo): buscar vuelos");
  };

  return (
    <div>
      <h2>Panel de Cliente</h2>
      <p>Usuario: {user?.nombre} ({user?.correo})</p>
      <p>Rol: {user?.rol}</p>

      <div>
        <button onClick={handleRefresh}>Refrescar perfil</button>
        <button onClick={handleDemoAction}>Acción demo</button>
        <button onClick={logout}>Cerrar sesión</button>
      </div>

      <hr />

      <ul>
        <li>Mis reservas (demo)</li>
        <li>Pagos y facturas (demo)</li>
        <li>Reclamos enviados (demo)</li>
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
