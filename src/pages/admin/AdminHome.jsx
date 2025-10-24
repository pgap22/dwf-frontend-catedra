import React, { useEffect, useMemo, useState } from "react";
import { getEstadisticas } from "../../api/estadisticasService";
import { extractHttpError } from "../../utils/extractHttpError";

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getEstadisticas();
      setStats(data || null);
      setUpdatedAt(new Date());
    } catch (e) {
      const { message } = extractHttpError(e);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // KPIs derivados (headless: solo texto)
  const kpis = useMemo(() => {
    if (!stats) return null;
    const act = Number(stats.totalReservasActivas || 0);
    const can = Number(stats.totalReservasCanceladas || 0);
    const comp = Number(stats.totalReservasCompletadas || 0);
    const canc = Number(stats.totalCancelaciones || 0);

    const total = act + can + comp;
    const tasaCancelacion = total > 0 ? (can / total) * 100 : 0;
    const tasaCumplimiento = total > 0 ? (comp / total) * 100 : 0;

    return {
      totalReservas: total,
      tasaCancelacion: Number.isFinite(tasaCancelacion) ? tasaCancelacion.toFixed(1) : "0.0",
      tasaCumplimiento: Number.isFinite(tasaCumplimiento) ? tasaCumplimiento.toFixed(1) : "0.0",
      totalCancelaciones: canc, // si tu backend define esto como distinto de canceladas (p. ej., solicitudes)
    };
  }, [stats]);

 return (
    <div className="space-y-8 p-4">
      <h2 className="text-3xl font-bold text-gray-800">
        Panel de Administración 📊
      </h2>
      <p className="text-gray-500 -mt-3">Resumen operativo del sistema</p>

      {/* Controles y Mensajes de Estado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white rounded-xl shadow-md border border-gray-200">
        <button
          onClick={refresh}
          disabled={loading}
          className={`px-5 py-2 rounded-lg font-medium transition duration-200 shadow-md ${
            loading
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading ? "Actualizando..." : "Refrescar Datos"}
        </button>
        {updatedAt ? (
          <span className="text-sm text-gray-500 mt-2 sm:mt-0">
            Última actualización:{" "}
            <span className="font-semibold text-gray-700">
              {updatedAt.toLocaleString()}
            </span>
          </span>
        ) : null}
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          Error al cargar datos: {error}
        </div>
      )}

      {/* Contenido principal (Métricas y KPIs) */}
      {!stats && !loading ? (
        <div className="p-10 text-center text-gray-500 bg-white rounded-xl shadow-lg">
          Sin datos disponibles. Intenta refrescar.
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Bloque de KPIs Derivados (Metric Cards) */}
          <section>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Indicadores Clave de Desempeño (KPIs)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* KPI 1: Total de Reservas */}
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500 transition duration-300 hover:shadow-xl">
                <p className="text-sm font-medium text-indigo-600">Total de Reservas</p>
                <p className="text-4xl font-extrabold text-gray-900 mt-1">
                  {kpis?.totalReservas || "—"}
                </p>
              </div>

              {/* KPI 2: Tasa de Cancelación */}
              <div className={`bg-white p-6 rounded-xl shadow-lg border-l-4 transition duration-300 hover:shadow-xl ${
                kpis?.tasaCancelacion > 5 ? 'border-red-500' : 'border-green-500'
              }`}>
                <p className="text-sm font-medium text-gray-600">Tasa de Cancelación</p>
                <p className={`text-4xl font-extrabold mt-1 ${
                  kpis?.tasaCancelacion > 5 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {kpis?.tasaCancelacion ? `${kpis.tasaCancelacion}%` : "—"}
                </p>
              </div>

              {/* KPI 3: Tasa de Cumplimiento */}
              <div className={`bg-white p-6 rounded-xl shadow-lg border-l-4 transition duration-300 hover:shadow-xl ${
                kpis?.tasaCumplimiento < 90 ? 'border-orange-500' : 'border-blue-500'
              }`}>
                <p className="text-sm font-medium text-gray-600">Tasa de Cumplimiento</p>
                <p className={`text-4xl font-extrabold mt-1 ${
                  kpis?.tasaCumplimiento < 90 ? 'text-orange-600' : 'text-blue-600'
                }`}>
                  {kpis?.tasaCumplimiento ? `${kpis.tasaCumplimiento}%` : "—"}
                </p>
              </div>

            </div>
          </section>
          
          {/* ======================= TABLA DE DETALLE (Métricas Crudas) ======================= */}
          <hr className="border-gray-300"/>

          <section>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Detalle de Métricas Operativas
            </h3>
            
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto max-w-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Indicador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  
                  {/* Fila: Reservas Activas */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Reservas Activas</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">{stats?.totalReservasActivas}</td>
                  </tr>

                  {/* Fila: Reservas Canceladas */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Reservas Canceladas</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">{stats?.totalReservasCanceladas}</td>
                  </tr>

                  {/* Fila: Reservas Completadas */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Reservas Completadas</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{stats?.totalReservasCompletadas}</td>
                  </tr>

                  {/* Fila: Total Cancelaciones (Transacciones) */}
                  <tr className="hover:bg-gray-50 border-t">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Transacciones de Cancelación</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-semibold">{stats?.totalCancelaciones}</td>
                  </tr>

                  {/* Fila: Tasa cancelación (%) */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Tasa Cancelación (%)</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{kpis?.tasaCancelacion}%</td>
                  </tr>

                  {/* Fila: Tasa cumplimiento (%) */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Tasa Cumplimiento (%)</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{kpis?.tasaCumplimiento}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
