import React, { useEffect, useRef, useState } from "react";
import {
    listTarifas,
    createTarifa,
    getTarifa,
    updateTarifa,
    deleteTarifa,
} from "../../api/tarifasService";
import { listClases } from "../../api/clasesService";

export default function TarifasAdmin() {
    // Listado
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Clases catálogo
    const [clases, setClases] = useState([]);

    // Búsqueda
    const [query, setQuery] = useState("");

    // Crear (fila superior)
    const [creating, setCreating] = useState(false);
    const [newRow, setNewRow] = useState({ codigo: "", claseId: "", reembolsable: false });

    // Edición por fila
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState({ codigo: "", claseId: "", reembolsable: false });
    const [savingId, setSavingId] = useState(null);

    // Eliminar
    const [deletingId, setDeletingId] = useState(null);

    // Feedback
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    const codigoEditRef = useRef(null);

    const refresh = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await listTarifas();
            setItems(Array.isArray(data) ? data : []);
        } catch (_) {
            setError("No se pudo cargar el listado de tarifas.");
        } finally {
            setLoading(false);
        }
    };

    const loadClases = async () => {
        try {
            const data = await listClases();
            setClases(Array.isArray(data) ? data : []);
        } catch (_) {
            // silencioso para no romper UX si falla el catálogo
        }
    };

    useEffect(() => { refresh(); loadClases(); }, []);

    // Helpers
    const normCode = (s) => (s || "").toUpperCase().trim();
    const validCode = (s) => /^[A-Z0-9]{2,8}$/.test(normCode(s));
    const validId = (x) => !!x && !Number.isNaN(Number(x));

    // Filtro local
    const filtered = items.filter((t) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        const reemb = String(t.reembolsable ? "si" : "no");
        return (
            String(t.codigo || "").toLowerCase().includes(q) ||
            String(t.clase?.nombre || "").toLowerCase().includes(q) ||
            reemb.includes(q) ||
            String(t.reembolsable).toLowerCase().includes(q)
        );
        // Ejemplos de búsqueda: "econ", "si", "no", "true", "false", "YB"
    });

    // Crear
    const handleCreate = async (e) => {
        e.preventDefault();
        setError(""); setInfo("");

        const payload = {
            codigo: normCode(newRow.codigo),
            claseId: Number(newRow.claseId),
            reembolsable: Boolean(newRow.reembolsable),
        };

        if (!validCode(payload.codigo)) return setError("Código inválido (2–8, A-Z 0-9).");
        if (!validId(payload.claseId)) return setError("Debes seleccionar una clase.");

        setCreating(true);
        try {
            await createTarifa(payload);
            setInfo("Tarifa creada.");
            setNewRow({ codigo: "", claseId: "", reembolsable: false });
            await refresh();
        } catch (_) {
            setError("No se pudo crear la tarifa.");
        } finally {
            setCreating(false);
        }
    };

    // Editar
    const startEdit = async (id) => {
        if (editingId === id) return;
        setError(""); setInfo("");
        try {
            const data = await getTarifa(id);
            setEditingId(id);
            setDraft({
                codigo: data?.codigo || "",
                claseId: data?.clase?.id || "",
                reembolsable: !!data?.reembolsable,
            });
            setTimeout(() => codigoEditRef.current?.focus(), 0);
        } catch (_) {
            setError("No se pudo obtener el detalle de la tarifa.");
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setDraft({ codigo: "", claseId: "", reembolsable: false });
    };

    const saveEdit = async (id) => {
        setError(""); setInfo("");
        const payload = {
            codigo: normCode(draft.codigo),
            claseId: Number(draft.claseId),
            reembolsable: !!draft.reembolsable,
        };

        if (!validCode(payload.codigo)) return setError("Código inválido (2–8, A-Z 0-9).");
        if (!validId(payload.claseId)) return setError("Debes seleccionar una clase.");

        setSavingId(id);
        try {
            await updateTarifa(id, payload);
            setInfo("Tarifa actualizada.");
            setEditingId(null);
            await refresh();
        } catch (_) {
            setError("No se pudo actualizar la tarifa.");
        } finally {
            setSavingId(null);
        }
    };

    // Eliminar
    const handleDelete = async (id) => {
        const ok = window.confirm("¿Eliminar esta tarifa?");
        if (!ok) return;
        setError(""); setInfo("");
        setDeletingId(id);
        try {
            await deleteTarifa(id);
            setInfo("Tarifa eliminada.");
            if (editingId === id) cancelEdit();
            await refresh();
        } catch (_) {
            setError("No se pudo eliminar la tarifa.");
        } finally {
            setDeletingId(null);
        }
    };

    // Teclado en edición
    const onEditKeyDown = (e, id) => {
        if (e.key === "Enter") {
            e.preventDefault();
            saveEdit(id);
        } else if (e.key === "Escape") {
            e.preventDefault();
            cancelEdit();
        }
    };

    return (
        <div className="space-y-6 p-4">
            <h3 className="text-3xl font-bold text-gray-800 border-b pb-2 mb-4">
                Gestión de Tarifas 💵
            </h3>

            {/* Control: Búsqueda y Recarga */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="relative flex-grow">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        placeholder="Buscar por Código, Clase o Reembolsable (Sí/No)..."
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Código</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-48">Clase</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Reembolsable</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Acciones</th>
                        </tr>

                        {/* Fila de Creación */}
                        <tr className="bg-blue-50 border-b border-blue-200">
                            <td className="px-6 py-3 text-sm text-gray-500 font-semibold">—</td>
                            <td>
                                <input
                                    placeholder="YB01"
                                    value={newRow.codigo}
                                    onChange={(e) =>
                                        setNewRow((s) => ({ ...s, codigo: e.target.value.toUpperCase() }))
                                    }
                                    maxLength={4}
                                    className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                            </td>
                            <td>
                                <select
                                    value={newRow.claseId}
                                    onChange={(e) => setNewRow((s) => ({ ...s, claseId: e.target.value }))}
                                    className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                                >
                                    <option value="">-- clase --</option>
                                    {clases.map((c) => (
                                        <option value={c.id} key={c.id}>
                                            {c.nombre} (#{c.id})
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className="px-6 py-3">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={newRow.reembolsable}
                                        onChange={(e) =>
                                            setNewRow((s) => ({ ...s, reembolsable: e.target.checked }))
                                        }
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                    />
                                    <span className="text-gray-700">Sí</span>
                                </label>
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
                                    {query ? "No se encontraron tarifas que coincidan con la búsqueda." : "Sin registros."}
                                </td>
                            </tr>
                        ) : null}

                        {filtered.map((t) => {
                            const isEditing = editingId === t.id;
                            const isSaving = savingId === t.id;
                            const isDeleting = deletingId === t.id;

                            return (
                                <tr
                                    key={t.id}
                                    className={`${isEditing ? "bg-yellow-50" : "hover:bg-gray-50"
                                        } transition duration-150`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {t.id}
                                    </td>

                                    {/* Código */}
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input
                                                ref={codigoEditRef}
                                                value={draft.codigo}
                                                onChange={(e) =>
                                                    setDraft((s) => ({ ...s, codigo: e.target.value.toUpperCase() }))
                                                }
                                                onKeyDown={(e) => onEditKeyDown(e, t.id)}
                                                placeholder="YB01"
                                                maxLength={4}
                                                className="w-full px-3 py-1 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 transition"
                                            />
                                        ) : (
                                            <span className="inline-block px-2 py-0.5 text-sm font-bold rounded-md bg-blue-100 text-blue-800">
                                                {t.codigo}
                                            </span>
                                        )}
                                    </td>

                                    {/* Clase */}
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <select
                                                value={draft.claseId}
                                                onChange={(e) => setDraft((s) => ({ ...s, claseId: e.target.value }))}
                                                onKeyDown={(e) => onEditKeyDown(e, t.id)}
                                                className="w-full px-3 py-1 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 transition"
                                            >
                                                <option value="">-- clase --</option>
                                                {clases.map((c) => (
                                                    <option value={c.id} key={c.id}>
                                                        {c.nombre} (#{c.id})
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="text-gray-700">
                                                {t.clase?.nombre || 'N/A'} {t.clase?.id ? `(#${t.clase.id})` : ""}
                                            </span>
                                        )}
                                    </td>

                                    {/* Reembolsable */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {isEditing ? (
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={!!draft.reembolsable}
                                                    onChange={(e) =>
                                                        setDraft((s) => ({ ...s, reembolsable: e.target.checked }))
                                                    }
                                                    onKeyDown={(e) => onEditKeyDown(e, t.id)}
                                                    className="form-checkbox h-5 w-5 text-blue-600 rounded border-yellow-400"
                                                />
                                                <span className="text-gray-700">Sí</span>
                                            </label>
                                        ) : t.reembolsable ? (
                                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Sí
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                No
                                            </span>
                                        )}
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {!isEditing ? (
                                            <>
                                                <button
                                                    onClick={() => startEdit(t.id)}
                                                    disabled={isDeleting}
                                                    className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(t.id)}
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
                                                    onClick={() => saveEdit(t.id)}
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
