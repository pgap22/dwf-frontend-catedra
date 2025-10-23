import React, { useEffect, useRef, useState } from "react";
import {
    listAeropuertos,
    createAeropuerto,
    getAeropuerto,
    updateAeropuerto,
    deleteAeropuerto,
} from "../../api/aeropuertosService";

export default function AeropuertosAdmin() {
    // Estado base
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filtro/búsqueda
    const [query, setQuery] = useState("");

    // Creación (fila superior)
    const [creating, setCreating] = useState(false);
    const [newRow, setNewRow] = useState({ codigoIata: "", nombre: "", ciudad: "", pais: "" });

    // Edición por fila
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState({ codigoIata: "", nombre: "", ciudad: "", pais: "" });
    const [savingId, setSavingId] = useState(null);

    // Eliminación
    const [deletingId, setDeletingId] = useState(null);

    // Feedback
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    const nombreEditRef = useRef(null);

    const refresh = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await listAeropuertos();
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            setError("No se pudo cargar el listado.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    // Helpers
    const normalizeIata = (s) => (s || "").toUpperCase().trim();
    const validIata = (s) => {
        const x = normalizeIata(s);
        return x.length === 3 && /^[A-Z]{3}$/.test(x);
    };

    // Búsqueda local
    const filtered = items.filter((a) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
            String(a.codigoIata || "").toLowerCase().includes(q) ||
            String(a.nombre || "").toLowerCase().includes(q) ||
            String(a.ciudad || "").toLowerCase().includes(q) ||
            String(a.pais || "").toLowerCase().includes(q)
        );
    });

    // Crear
    const handleCreate = async (e) => {
        e.preventDefault();
        setError(""); setInfo("");
        const payload = {
            codigoIata: normalizeIata(newRow.codigoIata),
            nombre: (newRow.nombre || "").trim(),
            ciudad: (newRow.ciudad || "").trim(),
            pais: (newRow.pais || "").trim(),
        };
        if (!validIata(payload.codigoIata)) return setError("Código IATA inválido (3 letras).");
        if (!payload.nombre) return setError("Nombre requerido.");
        if (!payload.ciudad) return setError("Ciudad requerida.");
        if (!payload.pais) return setError("País requerido.");

        setCreating(true);
        try {
            await createAeropuerto(payload);
            setNewRow({ codigoIata: "", nombre: "", ciudad: "", pais: "" });
            setInfo("Aeropuerto creado.");
            await refresh();
        } catch (e) {
            setError("No se pudo crear el aeropuerto.");
        } finally {
            setCreating(false);
        }
    };

    // Editar
    const startEdit = async (id) => {
        if (editingId === id) return;
        setError(""); setInfo("");
        try {
            const data = await getAeropuerto(id);
            setEditingId(id);
            setDraft({
                codigoIata: data?.codigoIata || "",
                nombre: data?.nombre || "",
                ciudad: data?.ciudad || "",
                pais: data?.pais || "",
            });
            setTimeout(() => nombreEditRef.current?.focus(), 0);
        } catch (e) {
            setError("No se pudo obtener el detalle.");
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setDraft({ codigoIata: "", nombre: "", ciudad: "", pais: "" });
    };

    const saveEdit = async (id) => {
        setError(""); setInfo("");
        const payload = {
            codigoIata: normalizeIata(draft.codigoIata),
            nombre: (draft.nombre || "").trim(),
            ciudad: (draft.ciudad || "").trim(),
            pais: (draft.pais || "").trim(),
        };
        if (!validIata(payload.codigoIata)) return setError("Código IATA inválido (3 letras).");
        if (!payload.nombre) return setError("Nombre requerido.");
        if (!payload.ciudad) return setError("Ciudad requerida.");
        if (!payload.pais) return setError("País requerido.");

        setSavingId(id);
        try {
            await updateAeropuerto(id, payload);
            setInfo("Aeropuerto actualizado.");
            setEditingId(null);
            await refresh();
        } catch (e) {
            setError("No se pudo actualizar.");
        } finally {
            setSavingId(null);
        }
    };

    // Eliminar
    const handleDelete = async (id) => {
        const ok = window.confirm("¿Eliminar este aeropuerto?");
        if (!ok) return;
        setError(""); setInfo("");
        setDeletingId(id);
        try {
            await deleteAeropuerto(id);
            setInfo("Aeropuerto eliminado.");
            if (editingId === id) cancelEdit();
            await refresh();
        } catch (e) {
            setError("No se pudo eliminar.");
        } finally {
            setDeletingId(null);
        }
    };

    // Teclado en edición (Enter/Esc)
    const onEditKeyDown = (e, id) => {
        if (e.key === "Enter") {
            e.preventDefault();
            saveEdit(id);
        } else if (e.key === "Escape") {
            e.preventDefault();
            cancelEdit();
        }
    };

    // NOTA: Se asume que las variables de estado y las funciones (query, newRow, filtered, loading, refresh, handleCreate, etc.)
    // están definidas en la lógica superior del componente.

    return (
        <div className="space-y-6 p-4">
            <h3 className="text-3xl font-bold text-gray-800 border-b pb-2 mb-4">
                Gestión de Aeropuertos 🌍
            </h3>

            {/* Control: Búsqueda y Recarga */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="relative flex-grow">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        placeholder="Buscar por IATA, Nombre, Ciudad o País..."
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">IATA</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-20">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-22">Ciudad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">País</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Acciones</th>
                        </tr>

                        {/* Fila de Creación */}
                        <tr className="bg-blue-50 border-b border-blue-200">
                            <td className="px-6 py-3 text-sm text-gray-500 font-semibold">—</td>
                            <td>
                                <input
                                    placeholder="AAA"
                                    value={newRow.codigoIata}
                                    onChange={(e) =>
                                        setNewRow((s) => ({ ...s, codigoIata: e.target.value.toUpperCase() }))
                                    }
                                    maxLength={3}
                                    className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                            </td>
                            <td>
                                <input
                                    placeholder="Nombre"
                                    value={newRow.nombre}
                                    onChange={(e) => setNewRow((s) => ({ ...s, nombre: e.target.value }))}
                                    className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                            </td>
                            <td>
                                <input
                                    placeholder="Ciudad"
                                    value={newRow.ciudad}
                                    onChange={(e) => setNewRow((s) => ({ ...s, ciudad: e.target.value }))}
                                    className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                            </td>
                            <td>
                                <input
                                    placeholder="País"
                                    value={newRow.pais}
                                    onChange={(e) => setNewRow((s) => ({ ...s, pais: e.target.value }))}
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
                                <td colSpan="6" className="text-center py-10 text-gray-500">
                                    {query ? "No se encontraron aeropuertos que coincidan con la búsqueda." : "Sin registros."}
                                </td>
                            </tr>
                        ) : null}

                        {filtered.map((a) => {
                            const isEditing = editingId === a.id;
                            const isSaving = savingId === a.id;
                            const isDeleting = deletingId === a.id;

                            return (
                                <tr
                                    key={a.id}
                                    className={`${isEditing ? "bg-yellow-50" : "hover:bg-gray-50"
                                        } transition duration-150`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {a.id}
                                    </td>

                                    {/* IATA */}
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input
                                                value={draft.codigoIata}
                                                onChange={(e) =>
                                                    setDraft((s) => ({ ...s, codigoIata: e.target.value.toUpperCase() }))
                                                }
                                                onKeyDown={(e) => onEditKeyDown(e, a.id)}
                                                placeholder="AAA"
                                                maxLength={3}
                                                className="w-full px-3 py-1 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 transition"
                                            />
                                        ) : (
                                            <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-md bg-blue-100 text-blue-800">
                                                {a.codigoIata}
                                            </span>
                                        )}
                                    </td>

                                    {/* Nombre */}
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input
                                                ref={nombreEditRef}
                                                value={draft.nombre}
                                                onChange={(e) => setDraft((s) => ({ ...s, nombre: e.target.value }))}
                                                onKeyDown={(e) => onEditKeyDown(e, a.id)}
                                                placeholder="Nombre"
                                                className="w-full px-3 py-1 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 transition"
                                            />
                                        ) : (
                                            <span className="text-gray-700">{a.nombre}</span>
                                        )}
                                    </td>

                                    {/* Ciudad */}
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input
                                                value={draft.ciudad}
                                                onChange={(e) => setDraft((s) => ({ ...s, ciudad: e.target.value }))}
                                                onKeyDown={(e) => onEditKeyDown(e, a.id)}
                                                placeholder="Ciudad"
                                                className="w-full px-3 py-1 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 transition"
                                            />
                                        ) : (
                                            <span className="text-gray-700">{a.ciudad}</span>
                                        )}
                                    </td>

                                    {/* País */}
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input
                                                value={draft.pais}
                                                onChange={(e) => setDraft((s) => ({ ...s, pais: e.target.value }))}
                                                onKeyDown={(e) => onEditKeyDown(e, a.id)}
                                                placeholder="País"
                                                className="w-full px-3 py-1 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 transition"
                                            />
                                        ) : (
                                            <span className="text-gray-700">{a.pais}</span>
                                        )}
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {!isEditing ? (
                                            <>
                                                <button
                                                    onClick={() => startEdit(a.id)}
                                                    disabled={isDeleting}
                                                    className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(a.id)}
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
                                                    onClick={() => saveEdit(a.id)}
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
