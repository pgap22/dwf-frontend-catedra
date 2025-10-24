import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import LogoutButton from "./LogoutButton"; // Asumo que este botón ya tiene sus estilos

export default function ClienteNavbar() {
  const { user, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!user) fetchUser();
  }, [user, fetchUser]);

  // Clase base para los links de navegación
  const baseLinkClass =
    "text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-150";
  
  // Clases que se aplicarán dinámicamente si el link está activo
  const activeLinkClass = "font-bold text-blue-600 underline decoration-2 underline-offset-4";

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 flex items-center gap-x-6 px-4 py-3">
      {/* Logo o Inicio */}
      <NavLink
        to="/cliente"
        className={({ isActive }) =>
          `${baseLinkClass} ${isActive ? activeLinkClass : ""}`
        }
        end // 'end' asegura que solo esté activo en la ruta exacta /cliente
      >
        Inicio
      </NavLink>

      {/* Links principales */}
      <NavLink
        to="/cliente/vuelos"
        className={({ isActive }) =>
          `${baseLinkClass} ${isActive ? activeLinkClass : ""}`
        }
      >
        Vuelos
      </NavLink>
      <NavLink
        to="/cliente/reservas"
        className={({ isActive }) =>
          `${baseLinkClass} ${isActive ? activeLinkClass : ""}`
        }
      >
        Mis Reservas
      </NavLink>
      <NavLink
        to="/cliente/pasajeros"
        className={({ isActive }) =>
          `${baseLinkClass} ${isActive ? activeLinkClass : ""}`
        }
      >
        Mis Pasajeros
      </NavLink>
      <NavLink
        to="/cliente/reclamos"
        className={({ isActive }) =>
          `${baseLinkClass} ${isActive ? activeLinkClass : ""}`
        }
      >
        Mis Reclamos
      </NavLink>
      <NavLink
        to="/cliente/perfil"
        className={({ isActive }) =>
          `${baseLinkClass} ${isActive ? activeLinkClass : ""}`
        }
      >
        Perfil
      </NavLink>

      {/* Sección de usuario a la derecha */}
      <div className="ml-auto flex items-center gap-4">
        <span className="text-sm text-gray-500 hidden sm:block">
          {user ? user.nombre || user.name || user.correo : "Cargando..."}
        </span>
        <LogoutButton />
      </div>
    </nav>
  );
}
