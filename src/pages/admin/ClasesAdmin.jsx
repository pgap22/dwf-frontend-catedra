import React, { useEffect, useRef, useState } from "react";
import {
    listClases,
    createClase,
    getClase,
    updateClase,
    deleteClase,
} from "../../api/clasesService";
import { extractHttpError } from "../../utils/extractHttpError";

export default function ClasesAdmin() {
    // listado
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // búsqueda
    const [query, setQuery] = useState("");

    // crear (fila superior)
    const [creating, setCreating] = useState(false);
    const [newRow, setNewRow] = useState({ nombre: "", descripcion: "" });

    // edición por fila
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState({ nombre: "", descripcion: "" });
    const [savingId, setSavingId] = useState(null);

    // eliminar
    const [deletingId, setDeletingId] = useState(null);

    // feedback
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    const nombreEditRef = useRef(null);

    const refresh = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await listClases();
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            const { message } = extractHttpError(e);
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refresh(); }, []);

    const validNombre = (s) => !!(s || "").trim();

    // filtro local
    const filtered = items.filter((c) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
            String(c.nombre || "").toLowerCase().includes(q) ||
            String(c.descripcion || "").toLowerCase().includes(q)
        );
    });

    // crear
    const handleCreate = async (e) => {
        e.preventDefault();
        setError(""); setInfo("");
        const payload = {
            nombre: (newRow.nombre || "").trim(),
            descripcion: (newRow.descripcion || "").trim(),
        };
        if (!validNombre(payload.nombre)) return setError("El nombre es requerido.");

        setCreating(true);
        try {
            await createClase(payload);
            setInfo("Clase creada.");
            setNewRow({ nombre: "", descripcion: "" });
            await refresh();
        } catch (e) {
            const { message } = extractHttpError(e);
            setError(message);
        } finally {
            setCreating(false);
        }
    };

    // editar
    const startEdit = async (id) => {
        if (editingId === id) return;
        setError(""); setInfo("");
        try {
            const data = await getClase(id);
            setEditingId(id);
            setDraft({
                nombre: data?.nombre || "",
                descripcion: data?.descripcion || "",
            });
            setTimeout(() => nombreEditRef.current?.focus(), 0);
        } catch (e) {
            const { message } = extractHttpError(e);
            setError(message);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setDraft({ nombre: "", descripcion: "" });
    };

    const saveEdit = async (id) => {
        setError(""); setInfo("");
        const payload = {
            nombre: (draft.nombre || "").trim(),
            descripcion: (draft.descripcion || "").trim(),
        };
        if (!validNombre(payload.nombre)) return setError("El nombre es requerido.");

        setSavingId(id);
        try {
            await updateClase(id, payload);
            setInfo("Clase actualizada.");
            setEditingId(null);
            await refresh();
        } catch (e) {
            const { message } = extractHttpError(e);
            setError(message);
        } finally {
            setSavingId(null);
        }
    };

    // eliminar
    const handleDelete = async (id) => {
        const ok = window.confirm("¿Eliminar esta clase?");
        if (!ok) return;
        setError(""); setInfo("");
        setDeletingId(id);
        try {
            await deleteClase(id);
            setInfo("Clase eliminada.");
            if (editingId === id) cancelEdit();
            await refresh();
        } catch (e) {
            const { message } = extractHttpError(e);
            setError(message);
        } finally {
            setDeletingId(null);
        }
    };

    // teclado en edición
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
                Gestión de Clases (Tarifas) 🏷️
            </h3>

            {/* Control: Búsqueda y Recarga */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="relative flex-grow">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        placeholder="Buscar por Nombre o Descripción..."
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-64">Descripción</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Acciones</th>
                        </tr>

                        {/* Fila de Creación */}
                        <tr className="bg-blue-50 border-b border-blue-200">
                            <td className="px-6 py-3 text-sm text-gray-500 font-semibold">—</td>
                            <td>
                                <input
                                    placeholder="Ej: ECONOMY"
                                    value={newRow.nombre}
                                    onChange={(e) => setNewRow((s) => ({ ...s, nombre: e.target.value }))}
                                    className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                            </td>
                            <td>
                                <input
                                    placeholder="Opcional: asientos estándar, sin equipaje"
                                    value={newRow.descripcion}
                                    onChange={(e) => setNewRow((s) => ({ ...s, descripcion: e.target.value }))}
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
                                <td colSpan="4" className="text-center py-10 text-gray-500">
                                    {query ? "No se encontraron clases que coincidan con la búsqueda." : "Sin registros."}
                                </td>
                            </tr>
                        ) : null}

                        {filtered.map((c) => {
                            const isEditing = editingId === c.id;
                            const isSaving = savingId === c.id;
                            const isDeleting = deletingId === c.id;

                            return (
                                <tr
                                    key={c.id}
                                    className={`${isEditing ? "bg-yellow-50" : "hover:bg-gray-50"
                                        } transition duration-150`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {c.id}
                                    </td>

                                    {/* Nombre */}
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input
                                                ref={nombreEditRef}
                                                value={draft.nombre}
                                                onChange={(e) => setDraft((s) => ({ ...s, nombre: e.target.value }))}
                                                onKeyDown={(e) => onEditKeyDown(e, c.id)}
                                                placeholder="Nombre"
                                                className="w-full px-3 py-1 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 transition"
                                            />
                                        ) : (
                                            <span className="text-gray-900 font-semibold">{c.nombre}</span>
                                        )}
                                    </td>

                                    {/* Descripción */}
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input
                                                value={draft.descripcion}
                                                onChange={(e) => setDraft((s) => ({ ...s, descripcion: e.target.value }))}
                                                onKeyDown={(e) => onEditKeyDown(e, c.id)}
                                                placeholder="Descripción"
                                                className="w-full px-3 py-1 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 transition"
                                            />
                                        ) : (
                                            <span className="text-gray-600">{c.descripcion || "— Sin descripción —"}</span>
                                        )}
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {!isEditing ? (
                                            <>
                                                <button
                                                    onClick={() => startEdit(c.id)}
                                                    disabled={isDeleting}
                                                    className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c.id)}
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
                                                    onClick={() => saveEdit(c.id)}
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
