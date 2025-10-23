import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout"; // NUEVO

import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import RoleRedirect from "./components/RoleRedirect";

// Admin pages
import AdminHome from "./pages/admin/AdminHome";              // NUEVO
import AerolineasAdmin from "./pages/admin/AerolineasAdmin";
import AeropuertosAdmin from "./pages/admin/AeropuertosAdmin";
import AvionesAdmin from "./pages/admin/AvionesAdmin";
import ClasesAdmin from "./pages/admin/ClasesAdmin";
import TarifasAdmin from "./pages/admin/TarifasAdmin";
import RutasAdmin from "./pages/admin/RutasAdmin";
import TripulantesAdmin from "./pages/admin/TripulantesAdmin";
import AsientosAdmin from "./pages/admin/AsientosAdmin";

// Otros paneles (agente/cliente)
import AgentPanel from "./pages/AgentPanel";
import ClientPanel from "./pages/ClientPanel";
import OperacionesAdmin from "./pages/admin/operaciones/OperacionesAdmin";
import OperacionDetalleAdmin from "./pages/admin/operaciones/OperacionDetalleAdmin";

function App() {
  const { fetchUser, token } = useAuthStore();

  useEffect(() => {
    if (token) fetchUser();
  }, [token]);

  return (
    <BrowserRouter>
      {/* Si quieres mostrar un sidebar global fuera del área admin, mantenlo aquí */}
      {/* {token && <Sidebar />} */}

      <Routes>
        {/* Home: redirección por rol */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoleRedirect />
            </ProtectedRoute>
          }
        />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin: layout + rutas anidadas */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="aerolineas" element={<AerolineasAdmin />} />
          <Route path="aeropuertos" element={<AeropuertosAdmin />} />
          <Route path="aviones" element={<AvionesAdmin />} />
          <Route path="clases" element={<ClasesAdmin />} />
          <Route path="tarifas" element={<TarifasAdmin />} />
          <Route path="rutas" element={<RutasAdmin />} />
          <Route path="tripulantes" element={<TripulantesAdmin />} />
          <Route path="asientos" element={<AsientosAdmin />} />

          <Route path="operaciones" element={<OperacionesAdmin />} />
          <Route path="operaciones/:id" element={<OperacionDetalleAdmin />} />
        </Route>

        {/* Rutas directas por rol (si las usas fuera del layout admin) */}
        <Route
          path="/agente"
          element={
            <ProtectedRoute roles={["AGENTE"]}>
              <AgentPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente"
          element={
            <ProtectedRoute roles={["CLIENTE"]}>
              <ClientPanel />
            </ProtectedRoute>
          }
        />

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
