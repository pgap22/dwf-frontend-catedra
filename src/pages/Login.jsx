import React, { useState } from "react";
import { login } from "../api/authService";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { setUser, setToken } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await login(correo, password);
      setToken(data.accessToken);
      setUser(data.user);
      navigate("/");
    } catch (err) {
      setError("Credenciales inválidas.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Iniciar sesión
        </h2>

        {/* Formulario de Login */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo de Correo */}
          <div>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out placeholder-gray-500"
            />
          </div>

          {/* Campo de Contraseña */}
          <div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out placeholder-gray-500"
            />
          </div>

          {/* Botón de Ingresar */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Ingresar
          </button>
        </form>

        {/* Mensaje de Error */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Enlace para Registrarse */}
        <p className="text-center text-gray-600 text-sm">
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-indigo-600 font-medium hover:text-indigo-800 transition duration-150 ease-in-out"
          >
            Crear una
          </Link>
        </p>
      </div>
    </div>
  );
}