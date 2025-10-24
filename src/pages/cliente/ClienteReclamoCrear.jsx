import React, { useEffect, useMemo, useState } from "react";
import { createReclamo } from "../../api/reclamosService";
import { listMisReservas } from "../../api/reservasService";

export default function ClienteReclamoCrear() {
  const [reservaId, setReservaId] = useState("");
  const [pasajeroId, setPasajeroId] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [reservas, setReservas] = useState([]);
  const [loadingRes, setLoadingRes] = useState(false);

  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoadingRes(true);
      setErr("");
      try {
        const data = await listMisReservas();
        setReservas(Array.isArray(data) ? data : []);
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "No se pudieron cargar tus reservas";
        setErr(msg);
      } finally {
        setLoadingRes(false);
      }
    })();
  }, []);

  // Helpers de etiqueta
  const fmtDateTime = (iso) => (iso ? new Date(iso).toLocaleString() : "-");
  const labelReserva = useMemo(
    () => (r) => {
      const codigo = r?.codigoReserva || r?.codigo || `#${r?.id}`;
      const op = r?.operacionVuelo || {};
      const vuelo = op?.vuelo || {};
      const num = vuelo?.numeroVuelo || "-";
      const ruta = vuelo?.ruta || {};
      const o = ruta?.origen?.codigoIata || ruta?.origen?.codigo || "-";
      const d = ruta?.destino?.codigoIata || ruta?.destino?.codigo || "-";
      const salida = fmtDateTime(op?.fechaSalida);
      return `${codigo} – ${num} – ${o}→${d} – ${salida}`;
    },
    []
  );

  const selectedReserva = useMemo(
    () => reservas.find((r) => String(r.id) === String(reservaId)),
    [reservas, reservaId]
  );

  const pasajerosDeReserva = useMemo(() => {
    const asientos = selectedReserva?.asientos || [];
    return asientos
      .filter((a) => a?.pasajero?.id)
      .map((a) => ({
        pasajeroId: a.pasajero.id,
        nombre: a.pasajero.nombreCompleto || a.pasajero.nombre || "Pasajero",
        asiento: a.asiento?.codigoAsiento || "-",
        clase:
          a.asiento?.clase?.nombre || a.tarifa?.clase?.nombre || "—",
      }));
  }, [selectedReserva]);

  // Reset pasajero si cambió la reserva
  useEffect(() => {
    setPasajeroId("");
  }, [reservaId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setOk("");
    setErr("");

    if (!reservaId) {
      setErr("Seleccioná una reserva.");
      return;
    }
    if (!pasajeroId) {
      setErr("Seleccioná el pasajero que realiza el reclamo.");
      return;
    }

    try {
      const payload = {
        reservaId: Number(reservaId),
        pasajeroId: Number(pasajeroId),
        descripcion,
      };
      const res = await createReclamo(payload);
      setOk(`Reclamo creado (id ${res?.id || "?"}).`);
      setReservaId("");
      setPasajeroId("");
      setDescripcion("");
    } catch (e) {
      // Mostrar mensaje general y, si existe, detalle del campo
      const details = e?.response?.data?.details;
      const detailsMsg = details
        ? Object.entries(details)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" | ")
        : "";
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Error al crear reclamo";
      setErr(detailsMsg ? `${msg} — ${detailsMsg}` : msg);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Crear Reclamo</h1>

      <form
        onSubmit={onSubmit}
        className="space-y-4 bg-white p-6 shadow-md rounded-lg border border-gray-200"
      >
        {/* Reserva */}
        <div>
          <label
            htmlFor="reserva"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Reserva
          </label>
          <select
            id="reserva"
            value={reservaId}
            onChange={(e) => setReservaId(e.target.value)}
            required
            disabled={loadingRes || !reservas.length}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="" disabled>
              {loadingRes ? "Cargando reservas..." : "Seleccioná una reserva"}
            </option>
            {reservas.map((r) => (
              <option key={r.id} value={r.id}>
                {labelReserva(r)}
              </option>
            ))}
          </select>
          {!loadingRes && !reservas.length && (
            <p className="text-xs text-gray-500 mt-1">
              No tenés reservas disponibles para reclamar.
            </p>
          )}
        </div>

        {/* Pasajero de esa reserva */}
        <div>
          <label
            htmlFor="pasajero"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Pasajero que reclama
          </label>
          <select
            id="pasajero"
            value={pasajeroId}
            onChange={(e) => setPasajeroId(e.target.value)}
            required
            disabled={!reservaId || !pasajerosDeReserva.length}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="" disabled>
              {!reservaId
                ? "Elegí primero una reserva"
                : pasajerosDeReserva.length
                ? "Seleccioná un pasajero"
                : "Esta reserva no tiene pasajeros"}
            </option>
            {pasajerosDeReserva.map((p) => (
              <option key={p.pasajeroId} value={p.pasajeroId}>
                {p.nombre} — Asiento {p.asiento} — {p.clase}
              </option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div>
          <label
            htmlFor="descripcion"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Descripción
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            rows={5}
            placeholder="Contanos el problema (equipaje, demora, servicio, etc.)"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm min-h-[120px]"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={!reservas.length}
        >
          Enviar Reclamo
        </button>
      </form>

      {ok && (
        <p className="p-3 bg-green-100 border border-green-300 text-green-800 rounded-md mt-4">
          {ok}
        </p>
      )}
      {err && (
        <p className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-md mt-4">
          {err}
        </p>
      )}
    </div>
  );
}
