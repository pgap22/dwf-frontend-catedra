import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listOperaciones } from "../../api/operacionesVueloService";
import { listTarifasByOperacion } from "../../api/tarifasOperacionService";
import { createReserva } from "../../api/reservasService";
import { listPasajeros } from "../../api/pasajerosService";

export default function ClienteHome() {
  const [ops, setOps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [pasajeros, setPasajeros] = useState([]);
  const [loadingPasajeros, setLoadingPasajeros] = useState(false);
  const [pasajerosError, setPasajerosError] = useState("");

  const [openRow, setOpenRow] = useState(null);
  const [tarifas, setTarifas] = useState([]);
  const [okMsg, setOkMsg] = useState("");

  const [formReserva, setFormReserva] = useState({
    tarifaOperacionId: "",
    pasajeroId: "",
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await listOperaciones();
        setOps(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(
          e?.response?.data?.message ||
            e?.message ||
            "Error al cargar operaciones"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingPasajeros(true);
      setPasajerosError("");
      try {
        const data = await listPasajeros();
        setPasajeros(Array.isArray(data) ? data : []);
      } catch (e) {
        setPasajerosError(
          e?.response?.data?.message ||
            e?.message ||
            "No se pudieron cargar los pasajeros."
        );
        setPasajeros([]);
      } finally {
        setLoadingPasajeros(false);
      }
    })();
  }, []);

  // ===== Helpers de formato =====
  const fmtDT = (iso) => (iso ? new Date(iso).toLocaleString() : "-");

  const fmtAeropuertoCorto = (a) => {
    if (!a) return "-";
    const iata = a.codigoIata || a.codigo || a.iata || a.sigla;
    const ciudad = a.ciudad || a.city;
    const pais = a.pais || a.country;
    if (iata && ciudad) return `${iata} — ${ciudad}${pais ? `, ${pais}` : ""}`;
    if (iata) return iata;
    return ciudad || "-";
  };

  const getOrigen = (op) =>
    fmtAeropuertoCorto(
      op?.vuelo?.ruta?.origen ||
        op?.ruta?.origen ||
        op?.origenAeropuerto ||
        op?.origen
    );

  const getDestino = (op) =>
    fmtAeropuertoCorto(
      op?.vuelo?.ruta?.destino ||
        op?.ruta?.destino ||
        op?.destinoAeropuerto ||
        op?.destino
    );

  const getCodigoRuta = (op) => {
    const o =
      op?.vuelo?.ruta?.origen?.codigoIata ||
      op?.ruta?.origen?.codigoIata ||
      op?.vuelo?.origen?.codigoIata ||
      op?.origen ||
      "-";
    const d =
      op?.vuelo?.ruta?.destino?.codigoIata ||
      op?.ruta?.destino?.codigoIata ||
      op?.vuelo?.destino?.codigoIata ||
      op?.destino ||
      "-";
    return `${o} → ${d}`;
  };

  const getVueloLabel = (op) => {
    const num = op?.vuelo?.numeroVuelo || "-";
    const air =
      op?.vuelo?.aerolinea?.codigoIata ||
      op?.vuelo?.aerolinea?.nombre ||
      "";
    return air ? `${air} ${num}` : num;
  };

  const abrirReserva = async (operacionId) => {
    setOpenRow(openRow === operacionId ? null : operacionId);
    setOkMsg("");
    setErr("");
    setFormReserva({
      tarifaOperacionId: "",
      pasajeroId: "",
    });

    if (openRow !== operacionId) {
      try {
        const t = await listTarifasByOperacion(operacionId);
        setTarifas(Array.isArray(t) ? t : []);
      } catch (e) {
        setErr(
          e?.response?.data?.message ||
            e?.message ||
            "No se pudieron cargar tarifas"
        );
        setTarifas([]);
      }
    }
  };

  const onCrearReserva = async (e, operacionVueloId) => {
    e.preventDefault();
    setOkMsg("");
    setErr("");

    if (!formReserva.tarifaOperacionId || !formReserva.pasajeroId) {
      setErr("Completa todos los campos de la reserva.");
      return;
    }

    try {
      const payload = {
        operacionVueloId,
        items: [
          {
            tarifaOperacionId: Number(formReserva.tarifaOperacionId),
            pasajeroId: Number(formReserva.pasajeroId),
          },
        ],
      };

      const r = await createReserva(payload);
      setOkMsg(
        `Reserva creada: ${r?.codigoReserva || r?.codigo || r?.id || "(sin código)"}`
      );
      setFormReserva({
        tarifaOperacionId: "",
        pasajeroId: "",
      });
      setOpenRow(null);
    } catch (e) {
      const details = e?.response?.data?.details;
      const detailsMsg = details
        ? Object.entries(details)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" | ")
        : "";
      setErr(
        (e?.response?.data?.message || e?.message || "Error al crear la reserva") +
          (detailsMsg ? ` — ${detailsMsg}` : "")
      );
    }
  };

  return (
    <div className="p-6 mx-52 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Buscar Vuelos</h1>

      {err && (
        <p className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-md">
          {err}
        </p>
      )}
      {okMsg && (
        <p className="p-3 bg-green-100 border border-green-300 text-green-800 rounded-md">
          {okMsg}
        </p>
      )}
      {loading && <p className="text-gray-500 italic">Cargando...</p>}
      {!ops.length && !loading && (
        <p className="text-gray-500 italic text-center p-4">Sin resultados</p>
      )}

      {!!ops.length && (
        <div className="shadow border border-gray-200 rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vuelo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ruta (IATA)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Origen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destino
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salida
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Llegada
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ops.map((op) => (
                <React.Fragment key={op.id}>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      #{op.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {getVueloLabel(op)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {getCodigoRuta(op)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {getOrigen(op)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {getDestino(op)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {fmtDT(op?.fechaSalida || op?.salida)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {fmtDT(op?.fechaLlegada || op?.llegada)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => abrirReserva(op.id)}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        {openRow === op.id ? "Cerrar" : "Reservar"}
                      </button>
                    </td>
                  </tr>

                  {openRow === op.id && (
                    <tr>
                      <td colSpan="8" className="p-0">
                        <form
                          onSubmit={(e) => onCrearReserva(e, op.id)}
                          className="p-6 bg-blue-50 space-y-4 border-t-2 border-blue-200"
                        >
                          <h4 className="text-xl font-semibold text-gray-800">
                            Crear reserva (Operación #{op.id})
                          </h4>

                          {/* Tarifa */}
                          <div>
                            <label
                              htmlFor={`tarifa-${op.id}`}
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Tarifa
                            </label>
                            <select
                              id={`tarifa-${op.id}`}
                              value={formReserva.tarifaOperacionId}
                              onChange={(e) =>
                                setFormReserva({
                                  ...formReserva,
                                  tarifaOperacionId: e.target.value,
                                })
                              }
                              required
                              className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="" disabled>
                                Seleccioná una tarifa
                              </option>
                              {tarifas.length > 0 ? (
                                tarifas.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {(t?.clase?.nombre || t?.clase || "Clase")} – $
                                    {(t?.precio || t?.monto || 0)}
                                  </option>
                                ))
                              ) : (
                                <option disabled>Cargando tarifas...</option>
                              )}
                            </select>
                          </div>

                          {/* Pasajero */}
                          <div>
                            <label
                              htmlFor={`pasajero-${op.id}`}
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Pasajero
                            </label>
                            <select
                              id={`pasajero-${op.id}`}
                              value={formReserva.pasajeroId}
                              onChange={(e) =>
                                setFormReserva({
                                  ...formReserva,
                                  pasajeroId: e.target.value,
                                })
                              }
                              required
                              disabled={loadingPasajeros}
                              className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="" disabled>
                                Seleccioná un pasajero
                              </option>
                              {pasajeros.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.nombreCompleto}
                                  {p.nroPasaporte ? ` — ${p.nroPasaporte}` : ""}
                                </option>
                              ))}
                            </select>
                            {loadingPasajeros && (
                              <p className="text-xs text-gray-500 mt-1">
                                Cargando pasajeros...
                              </p>
                            )}
                            {!loadingPasajeros && pasajeros.length === 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                No tenés pasajeros registrados.{" "}
                                <Link
                                  to="/cliente/pasajeros"
                                  className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  Crear pasajero
                                </Link>
                              </p>
                            )}
                            {pasajerosError && (
                              <p className="text-xs text-red-600 mt-1">
                                {pasajerosError}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="submit"
                              className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                              Confirmar reserva
                            </button>
                            <button
                              type="button"
                              onClick={() => setOpenRow(null)}
                              className="bg-white text-gray-900 border border-gray-300 px-4 py-2 rounded-md font-semibold shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
