import React from "react";
import { Link } from "react-router-dom";

export default function AdminPanel() {
  return (
    <div>
      <h2>Catálogos (Admin)</h2>
      <ul>
        <li><Link to="/admin/aerolineas">Aerolíneas</Link></li>
        <li><Link to="/admin/aeropuertos">Aeropuertos</Link></li>
        <li><Link to="/admin/aviones">Aviones</Link></li>
        <li><Link to="/admin/clases">Clases</Link></li>
        <li><Link to="/admin/tarifas">Tarifas</Link></li>
        <li><Link to="/admin/rutas">Rutas</Link></li>
        <li><Link to="/admin/tripulantes">Tripulantes</Link></li>
        <li><Link to="/admin/asientos">Asientos (por avión)</Link></li>
      </ul>
    </div>
  );
}
