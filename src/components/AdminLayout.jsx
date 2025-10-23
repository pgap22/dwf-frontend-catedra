import React from "react";
import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Barra Lateral (Aside) */}
            <aside className="fixed inset-y-0 left-0 z-30 w-64 hidden md:block bg-gray-800 shadow-2xl">
                <AdminSidebar />
            </aside>

            {/* Contenido Principal (Main) */}
            <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
                {/* Encabezado Opcional (Puedes añadir una barra superior aquí) */}
                <header className="flex items-center justify-between p-4 bg-white shadow-md border-b border-blue-200">
                    <h1 className="text-2xl font-semibold text-gray-800">Panel de Administración</h1>
                    {/* Aquí podrías poner un perfil de usuario o notificaciones */}
                </header>

                {/* Área de Contenido de las Rutas anidadas */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}