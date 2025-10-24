import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import LogoutButton from "./LogoutButton";

// Si tienes store de usuario, úsalo para ocultar por rol:
import { useAuthStore } from "../store/authStore";

function LinkItem({ to, children, className }) {
    const location = useLocation();
    const active = location.pathname === to;
    return (
        <li>
            <NavLink
                to={to}
                end={to === "/admin"} // Marca "/admin" como ruta exacta
                className={({ isActive }) =>
                    `flex items-center space-x-2 w-full transition duration-200 ease-in-out ${className || 'px-3 py-2 rounded-lg font-medium'} 
           ${isActive
                        ? 'bg-blue-700 text-white shadow-md'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                }
            >
                {/* Aquí puedes añadir un ícono si lo necesitas */}
                <span>{children}</span>
            </NavLink>
        </li>
    );
}

export default function AdminNavbar() {
    const user = useAuthStore((s) => s.user); // { rol: "ADMIN", nombre, ... }
    const [q, setQ] = useState("");           // filtro
    const [showCatalogs, setShowCatalogs] = useState(true);
    const searchRef = useRef(null);

    // Atajo "/" para enfocar el buscador
    useEffect(() => {
        const onKey = (e) => {
            // evita cuando el foco ya está en un input/textarea/select
            const tag = document.activeElement?.tagName?.toLowerCase();
            if (e.key === "/" && tag !== "input" && tag !== "textarea" && tag !== "select") {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Permitir solo a ADMIN ver este navbar (si no hay user, lo mostramos por defecto)
    if (user && user.rol && user.rol !== "ADMIN") return null;

    const linksMain = useMemo(() => ([
        { to: "/admin", label: "Inicio" },
        { to: "/admin/operaciones", label: "Operaciones" },
        { to: "/admin/reservas", label: "Reservas" },
        { to: "/admin/reclamos", label: "Reclamos" },
        // { to: "/admin/operaciones/buscar", label: "Buscar vuelos" }, // opcional
    ]), []);

    const linksCatalog = useMemo(() => ([
        { to: "/admin/aerolineas", label: "Aerolíneas" },
        { to: "/admin/aeropuertos", label: "Aeropuertos" },
        { to: "/admin/aviones", label: "Aviones" },
        { to: "/admin/clases", label: "Clases" },
        { to: "/admin/tarifas", label: "Tarifas" },
        { to: "/admin/rutas", label: "Rutas" },
        { to: "/admin/tripulantes", label: "Tripulantes" },
        { to: "/admin/asientos", label: "Asientos" },
    ]), []);

    // Filtro headless: oculta items que no matchean
    const matches = (label) =>
        !q.trim() || label.toLowerCase().includes(q.toLowerCase());

    return (
        <nav aria-label="Navegación administrativa" className="flex flex-col h-full space-y-4 p-4">

            {/* Título y Rol del Administrador */}
            <div className="pt-0 pb-4 border-b border-gray-700">
                <strong className="text-3xl font-extrabold text-blue-400">
                    Admin
                </strong>
                {user?.rol ? (
                    <span className="text-sm text-gray-400 block mt-0.5">
                        Rol: <span className="font-semibold text-gray-300">{user.rol}</span>
                    </span>
                ) : null}
            </div>

            {/* Barra de Búsqueda Rápida */}
            <div className="relative mb-2">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    ref={searchRef}
                    placeholder="Filtrar catálogos (/ | ⏎ navega)"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            const all = [...linksMain, ...linksCatalog].filter(x => matches(x.label));
                            if (all.length === 1) {
                                window.location.assign(all[0].to);
                            }
                        }
                    }}
                    // Clases de estilo del input
                    className="w-full px-4 py-2 pl-10 bg-gray-700 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                />
            </div>

            {/* Contenedor Flex para Listas de Navegación y Logout Button */}
            {/* Este div es la clave para la distribución vertical limpia */}
            <div className="flex flex-col flex-grow overflow-y-auto space-y-4">

                {/* Sección de Navegación Principal */}
                <section aria-label="Navegación principal" className="space-y-1">
                    <p className="text-xs font-semibold uppercase text-gray-400 mb-2 border-b border-gray-700 pb-1">Principal</p>
                    <ul className="space-y-1">
                        {linksMain.filter(x => matches(x.label)).map(x => (
                            <LinkItem key={x.to} to={x.to} className="text-gray-200 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-lg font-medium transition duration-200">
                                {x.label}
                            </LinkItem>
                        ))}
                    </ul>
                </section>

                {/* Sección de Catálogos (Expandible) */}
                <section aria-label="Catálogos" className="space-y-1">
                    <button
                        onClick={() => setShowCatalogs(s => !s)}
                        className="w-full text-left flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase text-gray-400 hover:text-blue-400 transition duration-200 border-b border-gray-700"
                    >
                        <span>Catálogos</span>
                        <svg className={`w-4 h-4 transform transition-transform ${showCatalogs ? 'rotate-180 text-blue-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {showCatalogs ? (
                        <ul className="space-y-1 mt-2">
                            {linksCatalog.filter(x => matches(x.label)).map(x => (
                                <LinkItem key={x.to} to={x.to} className="text-gray-300 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-lg text-sm transition duration-200">
                                    {x.label}
                                </LinkItem>
                            ))}
                        </ul>
                    ) : null}
                </section>

                {/* Sección de Usuario (empujada hacia abajo por flex-grow) */}
                <section aria-label="Información de usuario" className="pt-4 border-t border-gray-700 mt-auto">
                    <div className="mb-3">
                        {user?.nombre ? (
                            <div className="text-sm text-gray-400">
                                Usuario: <strong className="text-white block">{user.nombre}</strong>
                            </div>
                        ) : null}
                    </div>

                    {/* LogoutButton */}
                    <LogoutButton />
                </section>
            </div>
        </nav>
    );
}
