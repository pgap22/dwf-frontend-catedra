import React, { useEffect, useState } from "react";
import { listReservasAdmin } from "../../api/reservasService";
import { Link } from "react-router-dom";

export default function ReservasAdmin() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // filtros/paginación
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [estado, setEstado] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [aerolineaId, setAerolineaId] = useState("");
  const [origenId, setOrigenId] = useState("");
  const [destinoId, setDestinoId] = useState("");
  const [sort, setSort] = useState("fechaReserva");
  const [direction, setDirection] = useState("DESC");

  const fetchData = async () => {
    setLoading(true);
    setErr("");
    try {
      const params = { page, size, sort, direction };
      if (estado) params.estado = estado;
      if (fechaDesde) params.fechaDesde = fechaDesde;
      if (fechaHasta) params.fechaHasta = fechaHasta;
      if (aerolineaId) params.aerolineaId = Number(aerolineaId);
      if (origenId) params.origenId = Number(origenId);
      if (destinoId) params.destinoId = Number(destinoId);

      const data = await listReservasAdmin(params);
      setRows(Array.isArray(data?.content) ? data.content : []);
      setMeta({
        totalElements: data?.totalElements ?? 0,
        number: data?.number ?? page,
        size: data?.size ?? size,
        totalPages: data?.totalPages ?? 0,
      });
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Error al cargar reservas";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  // refetch por page/size/sort
  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [page, size, sort, direction]);

  // limpiar page si cambian filtros
  useEffect(() => { setPage(0); /* luego el user pulsa aplicar */ }, [estado, fechaDesde, fechaHasta, aerolineaId, origenId, destinoId]);

  const go = (p) => {
    if (!meta) return;
    if (p < 0 || p >= meta.totalPages) return;
    setPage(p);
  };

  const fmt = (iso) => (iso ? new Date(iso).toLocaleString() : "-");
  const vuelo = (r) => {
    const op = r?.operacionVuelo;
    const num = op?.vuelo?.numeroVuelo || "-";
    const iata = op?.vuelo?.aerolinea?.codigoIata || "";
    return iata ? `${iata} ${num}` : num;
  };
  const ruta = (r) => {
    const op = r?.operacionVuelo;
    const o = op?.vuelo?.ruta?.origen?.codigoIata || "-";
    const d = op?.vuelo?.ruta?.destino?.codigoIata || "-";
    return `${o} → ${d}`;
  };
  const estadoBadge = (s) => {
    const base = "inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold";
    switch ((s || "").toUpperCase()) {
      case "ACTIVA": return `${base} bg-indigo-100 text-indigo-800`;
      case "CANCELADA": return `${base} bg-red-100 text-red-800`;
      case "PENDIENTE_PAGO": return `${base} bg-yellow-100 text-yellow-800`;
      case "COMPLETADA": return `${base} bg-green-100 text-green-800`;
      default: return `${base} bg-gray-100 text-gray-700`;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h3 className="text-3xl font-bold text-gray-800 border-b pb-2 mb-2">
        Gestión de Reservas (ADMIN) 📘
      </h3>

      {/* Filtros en card */}
      <form
        onSubmit={(e)=>{ e.preventDefault(); fetchData(); }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 space-y-4"
      >
        <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-3">
          <select value={estado} onChange={e=>setEstado(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
            <option value="">Estado (todos)</option>
            <option value="ACTIVA">ACTIVA</option>
            <option value="CANCELADA">CANCELADA</option>
            <option value="PENDIENTE_PAGO">PENDIENTE_PAGO</option>
            <option value="COMPLETADA">COMPLETADA</option>
          </select>

          <input type="date" value={fechaDesde} onChange={e=>setFechaDesde(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          <input type="date" value={fechaHasta} onChange={e=>setFechaHasta(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />

          <div className="grid grid-cols-3 gap-2">
            <input type="number" value={aerolineaId} onChange={e=>setAerolineaId(e.target.value)} placeholder="aerolineaId" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            <input type="number" value={origenId} onChange={e=>setOrigenId(e.target.value)} placeholder="origenId" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            <input type="number" value={destinoId} onChange={e=>setDestinoId(e.target.value)} placeholder="destinoId" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select value={sort} onChange={e=>setSort(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option value="fechaReserva">fechaReserva</option>
              <option value="total">total</option>
              <option value="estado">estado</option>
            </select>
            <select value={direction} onChange={e=>setDirection(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option value="DESC">DESC</option>
              <option value="ASC">ASC</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            className={`px-5 py-2 rounded-lg font-medium transition shadow ${loading ? "bg-gray-300 text-gray-600" : "bg-blue-600 text-white hover:bg-blue-700"}`}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Aplicar filtros"}
          </button>
          <button
            type="button"
            className="px-5 py-2 rounded-lg font-medium border border-gray-300 hover:bg-gray-50"
            onClick={()=>{
              setEstado(""); setFechaDesde(""); setFechaHasta("");
              setAerolineaId(""); setOrigenId(""); setDestinoId("");
              setPage(0); fetchData();
            }}
          >
            Limpiar
          </button>
        </div>
      </form>

      {err && <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg">{err}</div>}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vuelo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Reserva</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {r.codigoReserva || r.codigo || r.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {r?.usuario?.correo || r?.usuario?.nombre || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={estadoBadge(r?.estado)}>{r?.estado || "-"}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {typeof r?.total === "number" ? `$${r.total}` : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{vuelo(r)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ruta(r)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{fmt(r?.fechaReserva)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {r?.codigoReserva && (
                    <Link
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                      to={`/cliente/reservas/${r.codigoReserva}`}
                      target="_blank" rel="noreferrer"
                    >
                      Ver
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && !loading && (
              <tr>
                <td className="px-6 py-10 text-center text-gray-500 italic" colSpan={8}>
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {meta && (
        <div className="flex items-center gap-2">
          <button onClick={()=>go(0)} disabled={page===0} className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">⏮</button>
          <button onClick={()=>go(page-1)} disabled={page===0} className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">◀</button>
          <span className="text-sm px-2">Página <b>{page+1}</b> / {Math.max(meta.totalPages,1)}</span>
          <button onClick={()=>go(page+1)} disabled={page>=meta.totalPages-1} className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">▶</button>
          <button onClick={()=>go(meta.totalPages-1)} disabled={page>=meta.totalPages-1} className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">⏭</button>

          <div className="ml-3">
            <select value={size} onChange={e=>setSize(Number(e.target.value))} className="px-3 py-1.5 rounded-md border border-gray-300">
              {[10,20,50].map(n=> <option key={n} value={n}>{n} / pág</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
