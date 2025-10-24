import React, { useEffect, useState } from "react";
import { listReclamosAdmin } from "../../api/reclamosService";
import { Link } from "react-router-dom";

export default function ReclamosAdmin() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await listReclamosAdmin();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || "Error al cargar reclamos";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = rows.filter(r => {
    if (!q.trim()) return true;
    const text = `${r?.descripcion || ""} ${r?.estado || ""} ${r?.pasajero?.nombreCompleto || ""}`.toLowerCase();
    return text.includes(q.toLowerCase());
  });

  const estadoBadge = (s) => {
    const base = "inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold";
    switch ((s || "").toUpperCase()) {
      case "PENDIENTE": return `${base} bg-yellow-100 text-yellow-800`;
      case "RESUELTO": return `${base} bg-green-100 text-green-800`;
      case "CERRADO": return `${base} bg-gray-100 text-gray-800`;
      case "EN_PROGRESO": return `${base} bg-blue-100 text-blue-800`;
      default: return `${base} bg-gray-100 text-gray-700`;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h3 className="text-3xl font-bold text-gray-800 border-b pb-2 mb-2">
        Reclamos (ADMIN) 📣
      </h3>

      {/* Buscador */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="relative max-w-lg">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            placeholder="Filtrar por descripción, estado o pasajero..."
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
      </div>

      {err && <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg">{err}</div>}
      {loading && <p className="text-gray-500 italic">Cargando...</p>}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reserva</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pasajero</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{r.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {r?.reservaCodigo ? (
                    <Link
                      to={`/cliente/reservas/${r.reservaCodigo}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {r.reservaCodigo}
                    </Link>
                  ) : r?.reservaId ? `#${r.reservaId}` : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {r?.pasajero?.nombreCompleto || r?.pasajero || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {r?.descripcion || r?.detalle || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={estadoBadge(r?.estado)}>{r?.estado || "SIN_ESTADO"}</span>
                </td>
              </tr>
            ))}
            {!filtered.length && !loading && (
              <tr>
                <td className="px-6 py-10 text-center text-gray-500 italic" colSpan={5}>
                  Sin reclamos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
