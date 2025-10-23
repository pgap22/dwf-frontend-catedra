import React, { useEffect, useRef, useState } from "react";
import {
    listAviones,
    createAvion,
    getAvion,
    updateAvion,
    deleteAvion,
} from "../../api/avionesService";

export default function AvionesAdmin() {
    // listado
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // búsqueda
    const [query, setQuery] = useState("");

    // crear (fila superior)
    const [creating, setCreating] = useState(false);
    const [newRow, setNewRow] = useState({ matricula: "", modelo: "", capacidadTotal: "" });

    // edición por fila
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState({ matricula: "", modelo: "", capacidadTotal: "" });
    const [savingId, setSavingId] = useState(null);

    // eliminar
    const [deletingId, setDeletingId] = useState(null);

    // feedback
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    const matriculaEditRef = useRef(null);

    const refresh = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await listAviones();
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            setError("No se pudo cargar el listado de aviones.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refresh(); }, []);

    // helpers
    const normMatric = (s) => (s || "").toUpperCase().trim();
    const validMatric = (s) => /^[A-Z0-9-]{3,10}$/.test(normMatric(s));
    const validCap = (s) => {
        const n = Number(s);
        return Number.isInteger(n) && n >= 1;
    };

    // filtro local
    const filtered = items.filter((a) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
            String(a.matricula || "").toLowerCase().includes(q) ||
            String(a.modelo || "").toLowerCase().includes(q)
        );
    });

    // crear
    const handleCreate = async (e) => {
        e.preventDefault();
        setError(""); setInfo("");
        const payload = {
            matricula: normMatric(newRow.matricula),
            modelo: (newRow.modelo || "").trim(),
            capacidadTotal: Number(newRow.capacidadTotal),
        };
        if (!validMatric(payload.matricula)) return setError("Matrícula inválida (3–10, A-Z 0-9 -).");
        if (!payload.modelo) return setError("Modelo requerido.");
        if (!validCap(payload.capacidadTotal)) return setError("Capacidad total debe ser entero ≥ 1.");

        setCreating(true);
        try {
            await createAvion(payload);
            setInfo("Avión creado.");
            setNewRow({ matricula: "", modelo: "", capacidadTotal: "" });
            await refresh();
        } catch (e) {
            setError("No se pudo crear el avión.");
        } finally {
            setCreating(false);
        }
    };

    // editar
    const startEdit = async (id) => {
        if (editingId === id) return;
        setError(""); setInfo("");
        try {
            const data = await getAvion(id);
            setEditingId(id);
            setDraft({
                matricula: data?.matricula || "",
                modelo: data?.modelo || "",
                capacidadTotal: String(data?.capacidadTotal ?? ""),
            });
            setTimeout(() => matriculaEditRef.current?.focus(), 0);
        } catch (e) {
            setError("No se pudo obtener el detalle del avión.");
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setDraft({ matricula: "", modelo: "", capacidadTotal: "" });
    };

    const saveEdit = async (id) => {
        setError(""); setInfo("");
        const payload = {
            matricula: normMatric(draft.matricula),
            modelo: (draft.modelo || "").trim(),
            capacidadTotal: Number(draft.capacidadTotal),
        };
        if (!validMatric(payload.matricula)) return setError("Matrícula inválida (3–10, A-Z 0-9 -).");
        if (!payload.modelo) return setError("Modelo requerido.");
        if (!validCap(payload.capacidadTotal)) return setError("Capacidad total debe ser entero ≥ 1.");

        setSavingId(id);
        try {
            await updateAvion(id, payload);
            setInfo("Avión actualizado.");
            setEditingId(null);
            await refresh();
        } catch (e) {
            setError("No se pudo actualizar el avión.");
        } finally {
            setSavingId(null);
        }
    };

    // eliminar
    const handleDelete = async (id) => {
        const ok = window.confirm("¿Eliminar este avión?");
        if (!ok) return;
        setError(""); setInfo("");
        setDeletingId(id);
        try {
            await deleteAvion(id);
            setInfo("Avión eliminado.");
            if (editingId === id) cancelEdit();
            await refresh();
        } catch (e) {
            setError("No se pudo eliminar el avión.");
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
                Gestión de Aviones 🛫
            </h3>

            {/* Control: Búsqueda y Recarga */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="relative flex-grow">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        placeholder="Buscar por Matrícula o Modelo..."
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Matrícula</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-48">Modelo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Capacidad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Acciones</th>
                        </tr>

                        {/* Fila de Creación */}
                        <tr className="bg-blue-50 border-b border-blue-200">
                            <td className="px-6 py-3 text-sm text-gray-500 font-semibold">—</td>
                            <td>
                                <input
                                    placeholder="YV-1234"
                                    value={newRow.matricula}
                                    onChange={(e) =>
                                        setNewRow((s) => ({ ...s, matricula: e.target.value.toUpperCase() }))
                                    }
                                    className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                            </td>
                            <td>
                                <input
                                    placeholder="B737-800"
                                    value={newRow.modelo}
                                    onChange={(e) => setNewRow((s) => ({ ...s, modelo: e.target.value }))}
                                    className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    placeholder="180"
                                    value={newRow.capacidadTotal}
                                    onChange={(e) => setNewRow((s) => ({ ...s, capacidadTotal: e.target.value }))}
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
                                    {query ? "No se encontraron aviones que coincidan con la búsqueda." : "Sin registros."}
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

                                    {/* Matrícula */}
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input
                                                ref={matriculaEditRef}
                                                value={draft.matricula}
                                                onChange={(e) =>
                                                    setDraft((s) => ({ ...s, matricula: e.target.value.toUpperCase() }))
                                                }
                                                onKeyDown={(e) => onEditKeyDown(e, a.id)}
                                                placeholder="YV-1234"
                                                className="w-full px-3 py-1 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 transition"
                                            />
                                        ) : (
                                            <span className="inline-block px-2 py-0.5 text-sm font-bold rounded-md bg-blue-100 text-blue-800">
                                                {a.matricula}
                                            </span>
                                        )}
                                    </td>

                                    {/* Modelo */}
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input
                                                value={draft.modelo}
                                                onChange={(e) => setDraft((s) => ({ ...s, modelo: e.target.value }))}
                                                onKeyDown={(e) => onEditKeyDown(e, a.id)}
                                                placeholder="B737-800"
                                                className="w-full px-3 py-1 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 transition"
                                            />
                                        ) : (
                                            <span className="text-gray-700">{a.modelo}</span>
                                        )}
                                    </td>

                                    {/* Capacidad */}
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={draft.capacidadTotal}
                                                onChange={(e) => setDraft((s) => ({ ...s, capacidadTotal: e.target.value }))}
                                                onKeyDown={(e) => onEditKeyDown(e, a.id)}
                                                placeholder="180"
                                                className="w-full px-3 py-1 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 transition"
                                            />
                                        ) : (
                                            <span className="text-gray-700 font-semibold">{a.capacidadTotal}</span>
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
