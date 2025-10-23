import React, { useState } from "react";
import { register as registerUser, login } from "../api/authService";
import { useAuthStore } from "../store/authStore";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const { setToken, setUser } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            // 1) Crear usuario (rol por defecto CLIENTE según API)
            await registerUser(nombre, correo, password);

            // 2) Autologin tras registro
            const data = await login(correo, password);
            setToken(data.accessToken);
            setUser(data.user);

            // 3) Redirigir al home (routing decidirá por rol)
            navigate("/");
        } catch (err) {
            // API contempla 400 (datos inválidos) y 409 (correo en uso)
            setError("No se pudo registrar. Verifica datos o usa otro correo.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6">
                <h2 className="text-3xl font-bold text-center text-gray-800">
                    Crear cuenta
                </h2>

                {/* Formulario de Registro */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Campos de Input (Nombre, Correo, Contraseña) */}

                    <div>
                        <input
                            placeholder="Nombre completo"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-150 ease-in-out placeholder-gray-500"
                        />
                    </div>

                    <div>
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-150 ease-in-out placeholder-gray-500"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Contraseña (mín. 8 caracteres)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-150 ease-in-out placeholder-gray-500"
                        />
                    </div>

                    {/* Botón de Registrarme */}
                    <button
                        type="submit"
                        className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                        Registrarme
                    </button>
                </form>

                {/* Mensaje de Error */}
                {error && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                {/* SNIPPET DE VOLVER AL LOGIN */}
                <p className="text-center text-gray-600 text-sm">
                    ¿Ya tienes cuenta?{" "}
                    <Link
                        to="/login"
                        className="text-purple-600 font-medium hover:text-purple-800 transition duration-150 ease-in-out"
                    >
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}
