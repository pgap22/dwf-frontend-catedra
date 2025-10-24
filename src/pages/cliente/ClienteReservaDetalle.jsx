import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getReservaByCodigo } from "../../api/reservasService";
import {
  createCancelacion,
  getCancelacionByReserva,
} from "../../api/cancelacionesService";

export default function ClienteReservaDetalle() {
  const { codigo } = useParams();
  const [reserva, setReserva] = useState(null);
  const [cancelInfo, setCancelInfo] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const data = await getReservaByCodigo(codigo);
        setReserva(data);
        if (data?.id) {
          try {
            const c = await getCancelacionByReserva(data.id);
            setCancelInfo(c || null);
          } catch {}
        }
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Error al cargar la reserva";
        setErr(msg);
      }
    })();
  }, [codigo]);

  const onCancelar = async () => {
    if (!reserva?.id) return;
    if (!window.confirm("¿Confirmar cancelación de la reserva?")) return;

    setErr("");
    setOk("");
    try {
      const payload = {
        reservaId: reserva.id,
        motivo: "Cancelación solicitada por el cliente",
      };
      const r = await createCancelacion(payload);
      setCancelInfo(r);
      setOk("Reserva cancelada correctamente.");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "No se pudo cancelar la reserva";
      setErr(msg);
    }
  };

  if (err)
    return (
      <p className="p-6 max-w-4xl mx-auto bg-red-100 border border-red-300 text-red-800 rounded-md">
        {err}
      </p>
    );
  if (!reserva)
    return (
      <p className="p-6 max-w-4xl mx-auto text-gray-500 italic">Cargando...</p>
    );

  const yaCancelada = !!cancelInfo;

  // ==== Helpers específicos a tu JSON ====
  const op = reserva.operacionVuelo || {};
  const vuelo = op.vuelo || {};
  const ruta = vuelo.ruta || {};
  const origen = ruta.origen || {};
  const destino = ruta.destino || {};
  const asientos = Array.isArray(reserva.asientos) ? reserva.asientos : [];

  const fmtDateTime = (iso) =>
    iso ? new Date(iso).toLocaleString() : "-";

  const fmtAero = (a) => {
    const code =
      a.codigoIata || a.codigo || a.code || a.iata || a.sigla || null;
    const nombre = a.nombre || a.name || null;
    const ciudad = a.ciudad || a.city || null;
    const pais = a.pais || a.country || null;
    if (code && (nombre || ciudad)) {
      return `${code} – ${nombre || ciudad}${pais ? `, ${pais}` : ""}`;
    }
    if (nombre && ciudad) return `${nombre} – ${ciudad}${pais ? `, ${pais}` : ""}`;
    return code || nombre || ciudad || "-";
  };

  // Cabecera
  const codigoReserva = reserva.codigoReserva || codigo;
  const estado = reserva.estado || "ACTIVA";
  const estadoNormalizado = (estado || "").toUpperCase();
  const puedePagar = !yaCancelada && estadoNormalizado === "ACTIVA";
  const numeroVuelo = vuelo.numeroVuelo || "-";
  const salida = fmtDateTime(op.fechaSalida);
  const llegada = fmtDateTime(op.fechaLlegada);
  const total = reserva.total ?? reserva.montoTotal ?? "-";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Reserva <span className="text-blue-700">{codigoReserva}</span>
          </h1>
          <p className="text-gray-600">
            Estado:{" "}
            <span className="px-2 py-0.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 border border-gray-200">
              {yaCancelada ? "CANCELADA" : estadoNormalizado}
            </span>
          </p>
        </div>

        <div className="flex gap-2">
          <Link to={`/cliente/reservas/${codigo}/pago`}>
            <button
              disabled={!puedePagar}
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {estadoNormalizado === "COMPLETADA" ? "Pagada" : "Realizar Pago"}
            </button>
          </Link>
          <button
            onClick={onCancelar}
            disabled={yaCancelada}
            className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {yaCancelada ? "Reserva cancelada" : "Cancelar Reserva"}
          </button>
        </div>
      </div>

      {ok && (
        <p className="p-3 bg-green-100 border border-green-300 text-green-800 rounded-md">
          {ok}
        </p>
      )}

      {/* Vuelo / Ruta */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Vuelo</h2>
          <dl className="text-gray-700 grid grid-cols-3 gap-y-2">
            <dt className="col-span-1 font-medium">Número</dt>
            <dd className="col-span-2">{numeroVuelo}</dd>

            <dt className="col-span-1 font-medium">Origen</dt>
            <dd className="col-span-2">{fmtAero(origen)}</dd>

            <dt className="col-span-1 font-medium">Destino</dt>
            <dd className="col-span-2">{fmtAero(destino)}</dd>

            <dt className="col-span-1 font-medium">Salida</dt>
            <dd className="col-span-2">{salida}</dd>

            <dt className="col-span-1 font-medium">Llegada</dt>
            <dd className="col-span-2">{llegada}</dd>
          </dl>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Resumen</h2>
          <dl className="text-gray-700 grid grid-cols-3 gap-y-2">
            <dt className="col-span-1 font-medium">Código</dt>
            <dd className="col-span-2">{codigoReserva}</dd>

            <dt className="col-span-1 font-medium">Aerolínea</dt>
            <dd className="col-span-2">
              {vuelo?.aerolinea?.nombre || vuelo?.aerolinea?.codigoIata || "-"}
            </dd>

            <dt className="col-span-1 font-medium">Total</dt>
            <dd className="col-span-2">${total}</dd>
          </dl>
        </div>
      </section>

      {/* Pasajeros */}
      <section className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Pasajeros</h2>

        {asientos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asiento
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clase
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Pagado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {asientos.map((a, i) => (
                  <tr key={a?.id ?? i}>
                    <td className="px-4 py-2 text-sm text-gray-700">{i + 1}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                      {a?.pasajero?.nombreCompleto || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {a?.pasajero?.nroPasaporte || a?.pasajero?.documento || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {a?.asiento?.codigoAsiento || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {a?.asiento?.clase?.nombre || a?.tarifa?.clase?.nombre || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      ${a?.precioPagado ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 italic">No hay pasajeros cargados.</p>
        )}
      </section>

      {/* Cancelación (si existe) */}
      {/* {yaCancelada && (
        <section className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Información de Cancelación
          </h2>
          <dl className="text-gray-700 grid grid-cols-3 gap-y-2">
            <dt className="col-span-1 font-medium">Motivo</dt>
            <dd className="col-span-2">{cancelInfo?.motivo || "-"}</dd>
            <dt className="col-span-1 font-medium">Fecha</dt>
            <dd className="col-span-2">{cancelInfo?.fecha || "-"}</dd>
            <dt className="col-span-1 font-medium">Estado</dt>
            <dd className="col-span-2">{cancelInfo?.estado || "CANCELADA"}</dd>
          </dl>
        </section>
      )} */}

      {/* Debug opcional */}
      <details className="mt-2">
        <summary
          className="cursor-pointer text-sm text-gray-600 hover:text-gray-800"
          onClick={(e) => {
            e.preventDefault();
            setShowJson((s) => !s);
          }}
        >
          {showJson ? "Ocultar JSON (debug)" : "Ver JSON (debug)"}
        </summary>
        {showJson && (
          <pre className="mt-2 bg-gray-900 text-green-300 p-4 rounded-md overflow-x-auto text-xs shadow-inner">
            {JSON.stringify(reserva, null, 2)}
          </pre>
        )}
      </details>
    </div>
  );
}
