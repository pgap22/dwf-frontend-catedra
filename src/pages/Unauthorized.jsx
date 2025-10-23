import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div>
      <h2>Acceso no autorizado</h2>
      <p>No tienes permisos para ver esta sección.</p>
      <Link to="/">Volver</Link>
    </div>
  );
}
