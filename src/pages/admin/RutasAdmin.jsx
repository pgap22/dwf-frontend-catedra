import React, { useEffect, useRef, useState } from "react";
import {
    listRutas,
    createRuta,
    getRuta,
    deleteRuta,
    updateRuta,        // Asegúrate de exponer este método en rutasService
} from "../../api/rutasService";
import { listAeropuertos } from "../../api/aeropuertosService";

export default function RutasAdmin() {
    // Listado y catálogos
    const [items, setItems] = useState([]);
    const [aeropuertos, setAeropuertos] = useState([]);
    const [loading, setLoading] = useState(false);

    // Búsqueda
    const [query, setQuery] = useState("");

    // Crear (fila superior)
    const [creating, setCreating] = useState(false);
    const [newRow, setNewRow] = useState({ origenId: "", destinoId: "", distanciaKm: "" });

    // Edición por fila
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState({ origenId: "", destinoId: "", distanciaKm: "" });
    const [savingId, setSavingId] = useState(null);

    // Eliminación
    const [deletingId, setDeletingId] = useState(null);

    // Feedback
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    const distanciaEditRef = useRef(null);

    const refresh = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await listRutas();
            setItems(Array.isArray(data) ? data : []);
        } catch (_) {
            setError("No se pudo cargar el listado de rutas.");
        } finally {
            setLoading(false);
        }
    };

    const loadAeropuertos = async () => {
        try {
            const data = await listAeropuertos();
            setAeropuertos(Array.isArray(data) ? data : []);
        } catch (_) {
            // silencioso
        }
    };

    useEffect(() => { refresh(); loadAeropuertos(); }, []);

    // Helpers
    const validId = (x) => !!x && !Number.isNaN(Number(x));
    const validKm = (x) => Number.isInteger(Number(x)) && Number(x) >= 1;

    // Render helpers
    const apLabel = (a) =>
        a ? `${a.codigoIata || ""} - ${a.nombre || ""}${a.ciudad ? ` (${a.ciudad}${a.pais ? ", " + a.pais : ""})` : ""}` : "";

    const findApById = (id) => aeropuertos.find((a) => String(a.id) === String(id));

    // Filtro local
    const filtered = items.filter((r) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        const o = r.origen || {};
        const d = r.destino || {};
        return (
            String(o.codigoIata || "").toLowerCase().includes(q) ||
            String(o.nombre || "").toLowerCase().includes(q) ||
            String(o.ciudad || "").toLowerCase().includes(q) ||
            String(o.pais || "").toLowerCase().includes(q) ||
            String(d.codigoIata || "").toLowerCase().includes(q) ||
            String(d.nombre || "").toLowerCase().includes(q) ||
            String(d.ciudad || "").toLowerCase().includes(q) ||
            String(d.pais || "").toLowerCase().includes(q) ||
            String(r.distanciaKm || "").toLowerCase().includes(q)
        );
    });

    // Crear
    const handleCreate = async (e) => {
        e.preventDefault();
        setError(""); setInfo("");
        const payload = {
            origenId: Number(newRow.origenId),
            destinoId: Number(newRow.destinoId),
            distanciaKm: Number(newRow.distanciaKm),
        };
        if (!validId(payload.origenId)) return setError("Selecciona un origen.");
        if (!validId(payload.destinoId)) return setError("Selecciona un destino.");
        if (String(payload.origenId) === String(payload.destinoId)) return setError("Origen y destino no pueden ser iguales.");
        if (!validKm(payload.distanciaKm)) return setError("Distancia debe ser entero ≥ 1.");

        setCreating(true);
        try {
            await createRuta(payload);
            setInfo("Ruta creada.");
            setNewRow({ origenId: "", destinoId: "", distanciaKm: "" });
            await refresh();
        } catch (_) {
            setError("No se pudo crear la ruta.");
        } finally {
            setCreating(false);
        }
    };

    // Editar
    const startEdit = async (id) => {
        if (editingId === id) return;
        setError(""); setInfo("");
        try {
            const data = await getRuta(id);
            setEditingId(id);
            setDraft({
                origenId: data?.origen?.id || "",
                destinoId: data?.destino?.id || "",
                distanciaKm: String(data?.distanciaKm ?? ""),
            });
            setTimeout(() => distanciaEditRef.current?.focus(), 0);
        } catch (_) {
            setError("No se pudo obtener el detalle de la ruta.");
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setDraft({ origenId: "", destinoId: "", distanciaKm: "" });
    };

    const saveEdit = async (id) => {
        setError(""); setInfo("");
        const payload = {
            origenId: Number(draft.origenId),
            destinoId: Number(draft.destinoId),
            distanciaKm: Number(draft.distanciaKm),
        };
        if (!validId(payload.origenId)) return setError("Selecciona un origen.");
        if (!validId(payload.destinoId)) return setError("Selecciona un destino.");
        if (String(payload.origenId) === String(payload.destinoId)) return setError("Origen y destino no pueden ser iguales.");
        if (!validKm(payload.distanciaKm)) return setError("Distancia debe ser entero ≥ 1.");

        setSavingId(id);
        try {
            await updateRuta(id, payload);
            setInfo("Ruta actualizada.");
            setEditingId(null);
            await refresh();
        } catch (_) {
            setError("No se pudo actualizar la ruta.");
        } finally {
            setSavingId(null);
        }
    };

    // Eliminar
    const handleDelete = async (id) => {
        const ok = window.confirm("¿Eliminar esta ruta?");
        if (!ok) return;
        setError(""); setInfo("");
        setDeletingId(id);
        try {
            await deleteRuta(id);
            setInfo("Ruta eliminada.");
            if (editingId === id) cancelEdit();
            await refresh();
        } catch (_) {
            setError("No se pudo eliminar la ruta.");
        } finally {
            setDeletingId(null);
        }
    };

    // Teclado en edición
    const onEditKeyDown = (e, id) => {
        if (e.key === "Enter") { e.preventDefault(); saveEdit(id); }
        else if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
    };

    return (
        <div className="space-y-6 p-4">
            <h3 className="text-3xl font-bold text-gray-800 border-b pb-2 mb-4">
                Gestión de Rutas 🗺️
            </h3>

            {/* Control: Búsqueda y Recarga */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="relative flex-grow">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        placeholder="Buscar por IATA, Ciudad o Distancia..."
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
            {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    Error: {error}
                </div>
            )}
            {info && (
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    Info: {info}
                </div>
            )}

            {/* Tabla de Catálogo CRUD en línea */}
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-40">Origen</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-40">Destino</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Distancia (km)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Acciones</th>
                        </tr>

                        {/* Fila de Creación */}
                        <tr className="bg-blue-50 border-b border-blue-200">
                            <td className="px-6 py-3 text-sm text-gray-500 font-semibold">—</td>
                            <td>
                                <select
                                    value={newRow.origenId}
                                    onChange={(e) => setNewRow((s) => ({ ...s, origenId: e.target.value }))}
                                    className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                                >
                                    <option value="">-- origen --</option>
                                    {aeropuertos.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.codigoIata} - {a.nombre}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <select
                                    value={newRow.destinoId}
                                    onChange={(e) => setNewRow((s) => ({ ...s, destinoId: e.target.value }))}
                                    className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                                >
                                    <option value="">-- destino --</option>
                                    {aeropuertos.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.codigoIata} - {a.nombre}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <input
                                    type="number"
                                    placeholder="Distancia"
                                    value={newRow.distanciaKm}
                                    onChange={(e) => setNewRow((s) => ({ ...s, distanciaKm: e.target.value }))}
                                    className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                            </td>
                            <td>
                                <button
                                    onClick={handleCreate}
                                    disabled={creating}
                                    className={`px-3 py-1 text-sm rounded-md font-semibold transition duration-200 ${creating
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
                                <td colSpan="5" className="text-center py-10 text-gray-500">
                                    {query ? "No se encontraron rutas que coincidan con la búsqueda." : "Sin registros."}
                                </td>
                            </tr>
                        ) : null}

                        {filtered.map((r) => {
                            const isEditing = editingId === r.id;
                            const isSaving = savingId === r.id;
                            const isDeleting = deletingId === r.id;

                            return (
                                <tr
                                    key={r.id}
                                    className={`${isEditing ? "bg-yellow-50" : "hover:bg-gray-50"
                                        } transition duration-150`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {r.id}
                                    </td>

                                    {/* Origen */}
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <select
                                                value={draft.origenId}
                                                onChange={(e) => setDraft((s) => ({ ...s, origenId: e.target.value }))}
                                                onKeyDown={(e) => onEditKeyDown(e, r.id)}
                                                className="w-full px-3 py-1 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 transition"
                                            >
                                                <option value="">-- origen --</option>
                                                {aeropuertos.map((a) => (
                                                    <option key={a.id} value={a.id}>
                                                        {a.codigoIata} - {a.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            apLabel(r.origen)
                                        )}
                                    </td>

                                    {/* Destino */}
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <select
                                                value={draft.destinoId}
                                                onChange={(e) => setDraft((s) => ({ ...s, destinoId: e.target.value }))}
                                                onKeyDown={(e) => onEditKeyDown(e, r.id)}
                                                className="w-full px-3 py-1 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 transition"
                                            >
                                                <option value="">-- destino --</option>
                                                {aeropuertos.map((a) => (
                                                    <option key={a.id} value={a.id}>
                                                        {a.codigoIata} - {a.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            apLabel(r.destino)
                                        )}
                                    </td>

                                    {/* Distancia */}
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                ref={distanciaEditRef}
                                                value={draft.distanciaKm}
                                                onChange={(e) => setDraft((s) => ({ ...s, distanciaKm: e.target.value }))}
                                                onKeyDown={(e) => onEditKeyDown(e, r.id)}
                                                placeholder="Distancia"
                                                className="w-full px-3 py-1 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 transition"
                                            />
                                        ) : (
                                            <span className="text-gray-900 font-semibold">
                                                {r.distanciaKm} <span className="text-gray-600 font-normal">km</span>
                                            </span>
                                        )}
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {!isEditing ? (
                                            <>
                                                <button
                                                    onClick={() => startEdit(r.id)}
                                                    disabled={isDeleting}
                                                    className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(r.id)}
                                                    disabled={isDeleting}
                                                    className={`text-red-600 hover:text-red-900 transition duration-150 ${isDeleting ? "opacity-50 cursor-not-allowed" : ""
                                                        }`}
                                                    aria-busy={isDeleting ? "true" : "false"}
                                                >
                                                    {isDeleting ? "Eliminando" : "Eliminar"}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => saveEdit(r.id)}
                                                    disabled={isSaving}
                                                    className={`px-3 py-1 text-xs rounded-md font-semibold transition duration-200 ${isSaving
                                                            ? "bg-green-300 cursor-not-allowed"
                                                            : "bg-green-600 text-white hover:bg-green-700"
                                                        }`}
                                                    aria-busy={isSaving ? "true" : "false"}
                                                >
                                                    {isSaving ? "Guardando" : "Guardar"}
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    disabled={isSaving}
                                                    className="px-3 py-1 text-xs rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200"
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
