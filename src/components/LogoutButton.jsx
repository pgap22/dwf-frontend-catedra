import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function LogoutButton() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center justify-center space-x-2 
                 px-4 py-2 text-sm font-medium 
                 text-red-600 bg-white border border-red-600 
                 rounded-lg shadow-sm 
                 hover:bg-red-50 hover:border-red-700 
                 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 
                 transition duration-150 ease-in-out"
    >
      {/* Ícono de Salida (Opcional, pero mejora la UX) */}
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        ></path>
      </svg>
      <span>Cerrar sesión</span>
    </button>
  );
}