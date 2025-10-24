import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { createPago } from "../../api/pagosService";
import { getReservaByCodigo } from "../../api/reservasService";

const nowLocal = () => {
  const d = new Date();
  d.setSeconds(0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
};

export default function ClienteReservaPago() {
  const { codigo } = useParams();
  const [reserva, setReserva] = useState(null);
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState("TARJETA");
  const [fechaPago, setFechaPago] = useState(nowLocal());
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const estadoReserva = useMemo(
    () => (reserva?.estado ? String(reserva.estado).toUpperCase() : ""),
    [reserva?.estado]
  );
  const puedePagar = estadoReserva === "ACTIVA";
  const disableInputs = loading || !puedePagar;

  const cargarReserva = async () => {
    setErr("");
    try {
      const data = await getReservaByCodigo(codigo);
      setReserva(data);
      if (data?.total != null) {
        setMonto(String(data.total));
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "No se pudo obtener la reserva";
      setErr(msg);
    }
  };

  useEffect(() => {
    cargarReserva();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setOk("");
    setErr("");

    if (!reserva?.id) {
      setErr("No se pudo resolver el ID de la reserva.");
      return;
    }
    if (!puedePagar) {
      setErr("Esta reserva no admite nuevos pagos.");
      return;
    }
    if (!monto || Number(monto) <= 0) {
      setErr("Ingrese un monto valido.");
      return;
    }
    if (!fechaPago) {
      setErr("Seleccione la fecha de pago.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        reservaId: Number(reserva.id),
        monto: Number(monto),
        metodoPago: metodo,
        fechaPago: new Date(fechaPago).toISOString(),
      };

      const respuesta = await createPago(payload);
      setOk(`Pago registrado (id ${respuesta?.id || "?"}).`);
      await cargarReserva();
    } catch (e) {
      const base = e?.response?.data?.message || e?.message || "Error al registrar el pago";
      const details = e?.response?.data?.details;
      const detailsMsg = details
        ? " - " +
          Object.entries(details)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" | ")
        : "";
      setErr(base + detailsMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold text-gray-800">Pago de la Reserva {codigo}</h1>

      {reserva && (
        <p className="text-gray-700">
          Reserva{" "}
          <strong className="font-medium text-gray-900">
            {reserva.codigoReserva || reserva.codigo || reserva.id}
          </strong>
          <Link
            to={`/cliente/reservas/${reserva.codigoReserva || reserva.codigo || codigo}`}
            className="ml-2 text-blue-600 hover:underline text-sm"
          >
            ver detalle
          </Link>
        </p>
      )}

      {err && (
        <p className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-md">
          {err}
        </p>
      )}

      {!puedePagar && reserva && (
        <p className="p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md">
          Esta reserva se encuentra en estado {estadoReserva || "DESCONOCIDO"}, por lo que no se pueden registrar
          nuevos pagos.
        </p>
      )}

      {ok && (
        <p className="p-3 bg-green-100 border border-green-300 text-green-800 rounded-md">
          {ok}
        </p>
      )}

      <form
        onSubmit={onSubmit}
        className="space-y-4 bg-white p-6 shadow-md rounded-lg border border-gray-200"
      >
        <div>
          <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-1">
            Monto
          </label>
          <input
            id="monto"
            type="number"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
            disabled={disableInputs}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {reserva?.total != null && (
            <p className="text-xs text-gray-500 mt-1">Sugerido: ${reserva.total}</p>
          )}
        </div>

        <div>
          <label htmlFor="metodo" className="block text-sm font-medium text-gray-700 mb-1">
            Metodo
          </label>
          <select
            id="metodo"
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
            disabled={disableInputs}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="TARJETA">Tarjeta</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>
        </div>

        <div>
          <label htmlFor="fechaPago" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de pago
          </label>
          <input
            id="fechaPago"
            type="datetime-local"
            value={fechaPago}
            onChange={(e) => setFechaPago(e.target.value)}
            required
            disabled={disableInputs}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Se enviara al servidor en formato ISO (UTC).</p>
        </div>

        <button
          type="submit"
          disabled={disableInputs}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Registrando..." : "Pagar"}
        </button>
      </form>
    </div>
  );
}
