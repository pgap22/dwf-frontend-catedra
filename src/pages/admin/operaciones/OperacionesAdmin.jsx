import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    listOperaciones,
    createOperacion,
    deleteOperacion,
} from "../../../api/operacionesVueloService";
import { listAviones } from "../../../api/avionesService";
import { listVuelos } from "../../../api/vuelosService"; // si no existe, ver fallback más abajo
import { extractHttpError } from "../../../utils/extractHttpError";

export default function OperacionesAdmin() {
    const nav = useNavigate();

    // estado base
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // catálogos
    const [aviones, setAviones] = useState([]);
    const [vuelos, setVuelos] = useState([]); // {id, numeroVuelo}
    const [catalogError, setCatalogError] = useState("");

    // búsqueda
    const [query, setQuery] = useState("");

    // crear (fila superior)
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        vueloId: "",
        avionId: "",
        fechaSalida: "",
        fechaLlegada: "",
        estado: "PROGRAMADO",
    });

    const refresh = async () => {
        setLoading(true);
        try {
            const data = await listOperaciones();
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            // mensaje simple headless
            console.error("Error al listar operaciones", e);
        } finally {
            setLoading(false);
        }
    };

    // carga catálogos
    const loadCatalogs = async () => {
        setCatalogError("");
        try {
            const [avs, vls] = await Promise.allSettled([listAviones(), safeListVuelos()]);
            if (avs.status === "fulfilled") setAviones(Array.isArray(avs.value) ? avs.value : []);
            if (vls.status === "fulfilled") setVuelos(Array.isArray(vls.value) ? vls.value : []);
            if (vls.status === "rejected") setCatalogError("No se pudo cargar el catálogo de vuelos.");
        } catch (e) {
            const { message } = extractHttpError(e);
            setCatalogError(message);
        }
    };

    // Fallback: si no tienes vuelosService real, aplanamos desde operaciones
    // para construir un catálogo mínimo de {id, numeroVuelo}
    const safeListVuelos = async () => {
        try {
            // intenta el catálogo real
            const data = await listVuelos();
            if (Array.isArray(data) && data.length && data[0]?.numeroVuelo) return data;
            // si viene algo raro, cae al fallback
            throw new Error("vuelosService no conforme, usando fallback");
        } catch {
            const ops = await listOperaciones();
            const set = new Map();
            (Array.isArray(ops) ? ops : []).forEach((op) => {
                const vId = op?.vuelo?.id ?? op?.vueloId ?? op?.id;
                const num = op?.vuelo?.numeroVuelo || `OP-${op?.id}`;
                if (vId && !set.has(vId)) set.set(vId, { id: vId, numeroVuelo: num });
            });
            return Array.from(set.values());
        }
    };

    useEffect(() => {
        refresh();
        loadCatalogs();
    }, []);

    const filtered = items.filter((o) => {
        const q = (query || "").toLowerCase().trim();
        if (!q) return true;
        const num = String(o?.vuelo?.numeroVuelo || "").toLowerCase();
        const mat = String(o?.avion?.matricula || "").toLowerCase();
        return num.includes(q) || mat.includes(q);
    });

    const validForm = () => {
        if (!form.vueloId || !form.avionId || !form.fechaSalida || !form.fechaLlegada) return false;
        // opcional: validar fechaSalida < fechaLlegada
        try {
            const fs = new Date(form.fechaSalida).getTime();
            const fl = new Date(form.fechaLlegada).getTime();
            if (Number.isFinite(fs) && Number.isFinite(fl) && fs >= fl) return false;
        } catch (_) { }
        return true;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!validForm()) return alert("Completa todos los campos y verifica fechas.");
        setCreating(true);
        try {
            await createOperacion({
                vueloId: Number(form.vueloId),
                avionId: Number(form.avionId),
                fechaSalida: form.fechaSalida,
                fechaLlegada: form.fechaLlegada,
                estado: form.estado,
            });
            setForm({
                vueloId: "",
                avionId: "",
                fechaSalida: "",
                fechaLlegada: "",
                estado: "PROGRAMADO",
            });
            await refresh();
        } catch (e) {
            const { message } = extractHttpError(e);
            alert(message);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        const ok = window.confirm("¿Eliminar esta operación?");
        if (!ok) return;
        try {
            await deleteOperacion(id);
            await refresh();
        } catch (e) {
            const { message } = extractHttpError(e);
            alert(message);
        }
    };

    const getEstadoClasses = (estado) => {
        switch (estado) {
            case 'ARRIBADO': return 'bg-green-100 text-green-800';
            case 'EN_VUELO': return 'bg-blue-100 text-blue-800';
            case 'PROGRAMADO': return 'bg-indigo-100 text-indigo-800';
            case 'CANCELADO': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-700';
        }
    };
    return (
        <div className="space-y-6 p-4">
            <h3 className="text-3xl font-bold text-gray-800 border-b pb-2 mb-4">
                Gestión de Operaciones de Vuelo ✈️
            </h3>

            {/* Control: Búsqueda y Recarga */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="relative flex-grow">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        placeholder="Buscar por N° Vuelo o Matrícula..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    />
                </div>

                <button
                    onClick={refresh}
                    disabled={loading}
                    className={`px-5 py-2 rounded-lg font-medium transition duration-200 shadow-md ${loading
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                >
                    {loading ? "Cargando..." : "Recargar Listado"}
                </button>
            </div>

            {/* Mensajes de Estado */}
            {catalogError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    Error: {catalogError}
                </div>
            )}

            {/* Tabla de Operaciones */}
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-40">Vuelo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">Avión</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-40">Salida (Fecha/Hora)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-40">Llegada Estimada</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Acciones</th>
                        </tr>

                        {/* Fila de Creación */}
                        <tr className="bg-blue-50 border-b border-blue-200">
                            <td className="px-6 py-3 text-sm text-gray-500 font-semibold">—</td>
                            <td>
                                <select
                                    value={form.vueloId}
                                    onChange={(e) => setForm((s) => ({ ...s, vueloId: e.target.value }))}
                                    className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                                >
                                    <option value="">-- vuelo --</option>
                                    {vuelos.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.numeroVuelo || `Vuelo #${v.id}`} ({v.ruta?.origen?.codigoIata} → {v.ruta?.destino?.codigoIata})
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <select
                                    value={form.avionId}
                                    onChange={(e) => setForm((s) => ({ ...s, avionId: e.target.value }))}
                                    className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                                >
                                    <option value="">-- avión --</option>
                                    {aviones.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.matricula} ({a.modelo})
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <input
                                    type="datetime-local"
                                    value={form.fechaSalida}
                                    onChange={(e) => setForm((s) => ({ ...s, fechaSalida: e.target.value }))}
                                    className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                                />
                            </td>
                            <td>
                                <input
                                    type="datetime-local"
                                    value={form.fechaLlegada}
                                    onChange={(e) => setForm((s) => ({ ...s, fechaLlegada: e.target.value }))}
                                    className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                                />
                            </td>
                            <td>
                                <select
                                    value={form.estado}
                                    onChange={(e) => setForm((s) => ({ ...s, estado: e.target.value }))}
                                    className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                                >
                                    <option value="PROGRAMADO">PROGRAMADO</option>
                                    {/* <option value="EN_VUELO">EN VUELO</option>
                                    <option value="ARRIBADO">ARRIBADO</option> */}
                                    <option value="CANCELADO">CANCELADO</option>
                                </select>
                            </td>
                            <td>
                                <button
                                    onClick={handleCreate}
                                    disabled={creating || !validForm()}
                                    className={`px-3 py-1 text-sm rounded-md font-semibold transition duration-200 ${creating || !validForm()
                                            ? "bg-blue-300 cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                >
                                    {creating ? "Guardando..." : "Crear"}
                                </button>
                            </td>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {filtered.length === 0 && !loading ? (
                            <tr>
                                <td colSpan="7" className="text-center py-10 text-gray-500">
                                    {query ? "No se encontraron operaciones de vuelo que coincidan con la búsqueda." : "Sin registros de operaciones."}
                                </td>
                            </tr>
                        ) : null}

                        {filtered.map((o) => (
                            <tr key={o.id} className="hover:bg-gray-50 transition duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {o.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                                    {o?.vuelo?.numeroVuelo || "—"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {o?.avion?.matricula || "—"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {o?.fechaSalida ? new Date(o.fechaSalida).toLocaleString() : "—"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {o?.fechaLlegada ? new Date(o.fechaLlegada).toLocaleString() : "—"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${getEstadoClasses(o.estado)}`}>
                                        {o.estado?.replace('_', ' ') || "—"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => nav(`/admin/operaciones/${o.id}`)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        Ver Detalle
                                    </button>
                                    <button
                                        onClick={() => handleDelete(o.id)}
                                        className="text-red-600 hover:text-red-900 transition duration-150"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
