import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ClientPanel() {
  const { user, logout } = useAuthStore();

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg border border-gray-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Panel de Cliente</h2>
          <p className="text-gray-700">
            Usuario: <strong className="font-medium text-gray-900">{user?.nombre}</strong>{" "}
            ({user?.correo})
          </p>
          <p className="text-gray-700">
            Rol:{" "}
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {user?.rol}
            </span>
          </p>
        </div>

        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Cerrar sesión
        </button>
      </div>

      <hr className="my-6 border-gray-200" />

      <h3 className="text-xl font-semibold text-gray-800 mb-3">Accesos rápidos</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Link
          to="/cliente/vuelos"
          className="block w-full text-center bg-white border border-gray-300 px-4 py-3 rounded-md font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Buscar vuelos
        </Link>

        <Link
          to="/cliente/reservas"
          className="block w-full text-center bg-white border border-gray-300 px-4 py-3 rounded-md font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Mis reservas
        </Link>

        <Link
          to="/cliente/pagos"
          className="block w-full text-center bg-white border border-gray-300 px-4 py-3 rounded-md font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Mis pagos
        </Link>

        <Link
          to="/cliente/reclamos"
          className="block w-full text-center bg-white border border-gray-300 px-4 py-3 rounded-md font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Mis reclamos
        </Link>

        <Link
          to="/cliente/perfil"
          className="block w-full text-center bg-white border border-gray-300 px-4 py-3 rounded-md font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Mi perfil
        </Link>
      </div>
    </div>
  );
}
