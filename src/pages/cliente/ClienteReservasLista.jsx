import React, { useEffect, useState } from "react";
import { listMisReservas } from "../../api/reservasService";
import { Link } from "react-router-dom";

// --- Componente auxiliar para la insignia de estado ---
const EstadoReserva = ({ estado }) => {
  let classes = "px-3 py-1 rounded-full text-xs font-semibold ";
  const status = String(estado).toLowerCase();

  switch (status) {
    case "confirmada":
      classes += "bg-green-100 text-green-700";
      break;
    case "pendiente":
    case "en_proceso":
      classes += "bg-yellow-100 text-yellow-700";
      break;
    case "cancelada":
      classes += "bg-red-100 text-red-700";
      break;
    default:
      classes += "bg-gray-100 text-gray-700";
  }
  return <span className={classes}>{estado || "N/A"}</span>;
};

// --- Componente principal ---

export default function ClienteReservasLista() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    // Lógica de carga...
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await listMisReservas();
        const arr = Array.isArray(data) ? data : [];
        setItems(arr);
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Error al cargar tus reservas";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- Helpers de Extracción de Datos ---

  const pickCodigo = (r) => r?.codigo ?? r?.codigoReserva ?? r?.code ?? r?.numero ?? null;
  const pickId = (r) => r?.id ?? r?.reservaId ?? r?.uuid ?? null;
  const detailParam = (r) => pickCodigo(r) ?? pickId(r);
  
  // Extrae la información más relevante para la tarjeta
  const getReservaInfo = (r) => {
    const operacion = r?.operacionVuelo || r?.operacion;
    const tarifa = r?.tarifaOperacion || r?.tarifa;

    return {
      codigo: pickCodigo(r),
      vuelo: operacion?.vuelo?.numeroVuelo || operacion?.numeroVuelo || "N/A",
      origen: operacion?.ruta?.origen?.codigo || "N/A",
      destino: operacion?.ruta?.destino?.codigo || "N/A",
      fechaSalida: operacion?.fechaSalida || "N/A",
      precio: tarifa?.precio || 0,
      estado: r?.estado || "Desconocido",
    };
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Encabezado y Botón */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Mis Reservas</h1>
        <Link
          to="/cliente/vuelos"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          ➕ Buscar Vuelos
        </Link>
      </div>

      {/* Estados de Carga/Error */}
      {loading && (
        <p className="text-center text-xl text-blue-500 italic my-10">
          Cargando tus reservas...
        </p>
      )}
      {err && (
        <p className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg my-4 font-medium">
          ⚠️ {err}
        </p>
      )}

      {/* Lista de Tarjetas de Reservas */}
      <div className="space-y-4">
        {!loading && !err && items.length === 0 && (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-lg text-gray-500 italic">
              Aún no tienes reservas. ¡Empieza a planear tu viaje!
            </p>
          </div>
        )}

        {items.map((r, idx) => {
          const param = detailParam(r);
          const info = getReservaInfo(r);

          // Si no tenemos un parámetro para el detalle, ignoramos la reserva (o la mostramos como no-clicable)
          if (!param) return null;

          return (
            <div
              key={r.id ?? r.codigo ?? r.codigoReserva ?? idx}
              className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-bold text-gray-900">
                  Reserva {info.codigo}
                </h2>
                <EstadoReserva estado={info.estado} />
              </div>

              {/* Grid de Detalles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <dt className="text-gray-500">Vuelo</dt>
                  <dd className="font-semibold text-gray-800">{info.vuelo}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Ruta</dt>
                  <dd className="font-semibold text-gray-800">
                    {info.origen} → {info.destino}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Salida</dt>
                  <dd className="font-semibold text-gray-800">
                    {info.fechaSalida !== "N/A"
                      ? new Date(info.fechaSalida).toLocaleDateString()
                      : "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Precio</dt>
                  <dd className="font-semibold text-blue-600">
                    {info.precio.toLocaleString("es-CL", {
                      style: "currency",
                      currency: "CLP", // O la moneda de tu sistema
                    })}
                  </dd>
                </div>
              </div>

              {/* Botón de Ver Detalle */}
              <div className="text-right pt-2 border-t border-gray-100">
                <Link
                  to={`/cliente/reservas/${param}`}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Ver Detalles y Opciones →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}