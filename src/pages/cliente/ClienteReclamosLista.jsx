import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { listMisReservas } from "../../api/reservasService";
import { getReclamosByReserva } from "../../api/reclamosService";

export default function ClienteReclamosLista() {
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [reclamos, setReclamos] = useState([]);

  // Para mostrar info útil de la reserva/reclamo
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        // 1) Traer todas mis reservas
        const mis = await listMisReservas();
        const rs = Array.isArray(mis) ? mis : [];
        setReservas(rs);

        // 2) Pedir reclamos por cada reserva y aplanar
        const reclamosPorReserva = await Promise.all(
          rs.map(async (r) => {
            try {
              const arr = await getReclamosByReserva(r.id);
              return Array.isArray(arr) ? arr : [];
            } catch {
              return [];
            }
          })
        );

        // 3) Flatten + de-dupe por id
        const flat = reclamosPorReserva.flat();
        const byId = new Map();
        flat.forEach((r) => {
          if (r?.id && !byId.has(r.id)) byId.set(r.id, r);
        });
        setReclamos(Array.from(byId.values()));
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Error al cargar tus reclamos";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  // Mapas para lookup rápido
  const reservaById = useMemo(() => {
    const m = new Map();
    (reservas || []).forEach((r) => m.set(r.id, r));
    return m;
  }, [reservas]);

  const labelReserva = (reservaId) => {
    const r = reservaById.get(reservaId);
    if (!r) return `Reserva #${reservaId}`;
    const codigo = r.codigoReserva || r.codigo || `#${r.id}`;
    const num = r?.operacionVuelo?.vuelo?.numeroVuelo || "-";
    const o = r?.operacionVuelo?.vuelo?.ruta?.origen?.codigoIata || "-";
    const d = r?.operacionVuelo?.vuelo?.ruta?.destino?.codigoIata || "-";
    return `${codigo} – ${num} – ${o}→${d}`;
  };

  const pasajeroNombre = (reservaId, pasajeroId) => {
    const r = reservaById.get(reservaId);
    const asientos = r?.asientos || [];
    const hit = asientos.find((a) => String(a?.pasajero?.id) === String(pasajeroId));
    return hit?.pasajero?.nombreCompleto || hit?.pasajero?.nombre || `Pasajero #${pasajeroId}`;
    };

  const statusPill = (estado) => {
    const s = String(estado || "").toLowerCase();
    if (["abierto", "abierta"].includes(s)) return "bg-yellow-100 text-yellow-800";
    if (["en_proceso", "en proceso", "en_progreso"].includes(s)) return "bg-blue-100 text-blue-800";
    if (["resuelto", "resuelta"].includes(s)) return "bg-green-100 text-green-800";
    if (["cerrado", "cerrada"].includes(s)) return "bg-gray-100 text-gray-800";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Mis Reclamos</h1>
        <Link
          to="/cliente/reclamos/nuevo"
          className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Crear Reclamo
        </Link>
      </div>

      {err && (
        <p className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-md my-4">
          {err}
        </p>
      )}
      {loading && <p className="text-gray-500 italic">Cargando...</p>}

      <ul className="space-y-3">
        {reclamos.map((r) => (
          <li
            key={r.id}
            className="p-4 bg-white shadow border border-gray-200 rounded-md text-gray-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusPill(
                      r.estado
                    )}`}
                  >
                    {r.estado || "SIN ESTADO"}
                  </span>
                  <span className="text-sm text-gray-600">
                    {labelReserva(r.reservaId)}
                  </span>
                </div>
                <p className="mt-2 text-gray-900">{r.detalle || r.descripcion}</p>
                <p className="mt-1 text-sm text-gray-600">
                  Pasajero: {pasajeroNombre(r.reservaId, r.pasajeroId)}
                </p>
              </div>
              <div className="text-right">
                <Link
                  to={`/cliente/reservas/${(reservaById.get(r.reservaId)?.codigoReserva) || r.reservaCodigo || r.reservaId}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                  title="Ver reserva"
                >
                  Ver reserva
                </Link>
              </div>
            </div>
          </li>
        ))}

        {!loading && !reclamos.length && (
          <li className="text-gray-500 italic p-4 text-center">Sin reclamos</li>
        )}
      </ul>
    </div>
  );
}
