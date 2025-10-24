import React, { useEffect, useRef, useState } from "react";
import {
    createAsiento,
    listAsientosPorAvion,
    getAsiento,
    updateAsiento,
    deleteAsiento,
} from "../../api/asientosService";

// Opcional: si tienes estos servicios, usamos dropdowns.
import { listAviones } from "../../api/avionesService";
import { listClases } from "../../api/clasesService";
import { extractHttpError } from "../../utils/extractHttpError";

export default function AsientosAdmin() {
    // Catálogos opcionales
    const [aviones, setAviones] = useState([]);
    const [clases, setClases] = useState([]);

    // Selección de avión para listar
    const [avionIdListado, setAvionIdListado] = useState("");
    const [cargandoListado, setCargandoListado] = useState(false);

    // Listado de asientos del avión seleccionado
    const [listado, setListado] = useState([]);

    // Fila de creación (usa avión seleccionado)
    const [creating, setCreating] = useState(false);
    const [crear, setCrear] = useState({ avionId: "", claseId: "", codigoAsiento: "" });

    // Edición por fila
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState({ avionId: "", claseId: "", codigoAsiento: "" });
    const [savingId, setSavingId] = useState(null);

    // Eliminación
    const [deletingId, setDeletingId] = useState(null);

    // Feedback
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    const codigoEditRef = useRef(null);

    // Helpers
    const normalizeCode = (s) => (s || "").toUpperCase().trim();
    const validSeat = (s) => /^[0-9]{1,2}[A-Z]$/.test(normalizeCode(s)); // ej: 1A, 12C
    const validId = (x) => !!x && !Number.isNaN(Number(x));

    // Cargar catálogos (opcional)
    const loadCatalogs = async () => {
        try {
            const [avs, cls] = await Promise.allSettled([listAviones(), listClases()]);
            if (avs.status === "fulfilled" && Array.isArray(avs.value)) setAviones(avs.value);
            if (cls.status === "fulfilled" && Array.isArray(cls.value)) setClases(cls.value);
        } catch (_) { }
    };

    useEffect(() => {
        loadCatalogs();
    }, []);

    // Sincronizar avionId en la fila de crear con el selector principal
    useEffect(() => {
        setCrear((s) => ({ ...s, avionId: avionIdListado || "" }));
    }, [avionIdListado]);

    const handleListarPorAvion = async () => {
        setError(""); setInfo("");
        if (!validId(avionIdListado)) {
            setListado([]);
            return setError("Selecciona un avión válido para listar.");
        }
        setCargandoListado(true);
        try {
            const data = await listAsientosPorAvion(avionIdListado);
            setListado(Array.isArray(data) ? data : []);
            if (data?.length === 0) setInfo("Sin asientos para este avión.");
        } catch (e) {
            const { message } = extractHttpError(e);
            setError(message);
        } finally {
            setCargandoListado(false);
        }
    };

    // Crear
    const handleCrear = async (e) => {
        e.preventDefault();
        setError(""); setInfo("");

        const payload = {
            avionId: Number(crear.avionId),
            claseId: Number(crear.claseId),
            codigoAsiento: normalizeCode(crear.codigoAsiento),
        };

        if (!validId(payload.avionId)) return setError("avionId requerido.");
        if (!validId(payload.claseId)) return setError("claseId requerido.");
        if (!validSeat(payload.codigoAsiento)) return setError("Código de asiento inválido (ej. 12A).");

        setCreating(true);
        try {
            await createAsiento(payload);
            setInfo("Asiento creado.");
            setCrear({ avionId: String(payload.avionId), claseId: "", codigoAsiento: "" });
            if (String(avionIdListado) === String(payload.avionId)) await handleListarPorAvion();
        } catch (e) {
            const { message } = extractHttpError(e);
            setError(message);
        } finally {
            setCreating(false);
        }
    };

    // Editar
    const startEdit = async (id) => {
        if (editingId === id) return;
        setError(""); setInfo("");
        try {
            const data = await getAsiento(id);
            setEditingId(id);
            setDraft({
                avionId: data?.avionId ?? avionIdListado ?? "",
                claseId: data?.clase?.id ?? "",
                codigoAsiento: data?.codigoAsiento ?? "",
            });
            setTimeout(() => codigoEditRef.current?.focus(), 0);
        } catch (e) {
            const { message } = extractHttpError(e);
            setError(message);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setDraft({ avionId: "", claseId: "", codigoAsiento: "" });
    };

    const saveEdit = async (id) => {
        setError(""); setInfo("");

        const payload = {
            avionId: Number(draft.avionId),
            claseId: Number(draft.claseId),
            codigoAsiento: normalizeCode(draft.codigoAsiento),
        };

        if (!validId(payload.avionId)) return setError("avionId requerido.");
        if (!validId(payload.claseId)) return setError("claseId requerido.");
        if (!validSeat(payload.codigoAsiento)) return setError("Código de asiento inválido (ej. 12A).");

        setSavingId(id);
        try {
            await updateAsiento(id, payload);
            setInfo("Asiento actualizado.");
            setEditingId(null);
            await handleListarPorAvion(); // refresca tabla si se está viendo ese avión
        } catch (e) {
            const { message } = extractHttpError(e);
            setError(message);
        } finally {
            setSavingId(null);
        }
    };

    // Eliminar
    const handleDelete = async (id) => {
        const ok = window.confirm("¿Eliminar este asiento?");
        if (!ok) return;
        setError(""); setInfo("");
        setDeletingId(id);
        try {
            await deleteAsiento(id);
            setInfo("Asiento eliminado.");
            if (editingId === id) cancelEdit();
            await handleListarPorAvion();
        } catch (e) {
            const { message } = extractHttpError(e);
            setError(message);
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

    return (
        <div className="space-y-6 p-4">
            <h3 className="text-3xl font-bold text-gray-800 border-b pb-2 mb-4">
                Gestión de Asientos por Avión 💺
            </h3>

            {/* Selector de Avión y Botón de Carga (Control Primario) */}
            <div className="p-4 bg-white rounded-xl shadow-lg border-2 border-blue-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <label className="text-lg font-semibold text-gray-700 whitespace-nowrap pt-1">
                    Seleccionar Avión:
                </label>

                {/* Selector de Avión */}
                <select
                    value={avionIdListado}
                    onChange={(e) => setAvionIdListado(e.target.value)}
                    className="flex-grow max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                >
                    <option value="">-- Selecciona un Avión --</option>
                    {aviones.map((a) => (
                        <option key={a.id} value={a.id}>
                            {a.matricula} ({a.modelo}) [ID: {a.id}]
                        </option>
                    ))}
                </select>

                {/* Botón de Carga */}
                <button
                    onClick={handleListarPorAvion}
                    disabled={!avionIdListado || cargandoListado}
                    className={`px-5 py-2 rounded-lg font-medium transition duration-200 shadow-md ${!avionIdListado || cargandoListado
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                >
                    {cargandoListado ? "Cargando..." : "Cargar Asientos"}
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

            {/* Tabla de Asientos */}
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Código</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-40">Clase</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Acciones</th>
                        </tr>

                        {/* Fila de Creación */}
                        <tr className="bg-blue-50 border-b border-blue-200">
                            <td className="px-6 py-3 text-sm text-gray-500 font-semibold">—</td>
                            <td>
                                <input
                                    placeholder="12A"
                                    value={crear.codigoAsiento}
                                    onChange={(e) =>
                                        setCrear((s) => ({ ...s, codigoAsiento: e.target.value.toUpperCase() }))
                                    }
                                    disabled={!avionIdListado || cargandoListado}
                                    className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:text-gray-500"
                                />
                            </td>
                            <td>
                                <select
                                    value={crear.claseId}
                                    onChange={(e) => setCrear((s) => ({ ...s, claseId: e.target.value }))}
                                    disabled={!avionIdListado || cargandoListado}
                                    className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:text-gray-500"
                                >
                                    <option value="">-- clase --</option>
                                    {clases.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre} (#{c.id})
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <button
                                    onClick={handleCrear}
                                    disabled={creating || !avionIdListado || cargandoListado}
                                    title={!avionIdListado ? "Selecciona un avión" : ""}
                                    className={`px-3 py-1 text-sm rounded-md font-semibold transition duration-200 ${creating || !avionIdListado
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
                        {/* Mensajes de estado de la tabla */}
                        {!avionIdListado ? (
                            <tr>
                                <td colSpan="4" className="text-center py-10 text-gray-500 bg-gray-50">
                                    Por favor, selecciona un avión para ver y gestionar sus asientos.
                                </td>
                            </tr>
                        ) : cargandoListado ? (
                            <tr>
                                <td colSpan="4" className="text-center py-10 text-blue-600 font-medium bg-gray-50">
                                    Cargando asientos...
                                </td>
                            </tr>
                        ) : listado.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-10 text-gray-500">
                                    Sin asientos para el avión seleccionado. Utiliza el formulario de Creación.
                                </td>
                            </tr>
                        ) : null}

                        {/* Filas de Datos */}
                        {listado.map((x) => {
                            const isEditing = editingId === x.id;
                            const isSaving = savingId === x.id;
                            const isDeleting = deletingId === x.id;

                            return (
                                <tr
                                    key={x.id}
                                    className={`${isEditing ? "bg-yellow-50" : "hover:bg-gray-50"
                                        } transition duration-150`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {x.id}
                                    </td>

                                    {/* Código asiento */}
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input
                                                ref={codigoEditRef}
                                                value={draft.codigoAsiento}
                                                onChange={(e) =>
                                                    setDraft((s) => ({ ...s, codigoAsiento: e.target.value.toUpperCase() }))
                                                }
                                                onKeyDown={(e) => onEditKeyDown(e, x.id)}
                                                placeholder="12A"
                                                maxLength={4}
                                                className="w-full px-3 py-1 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 transition"
                                            />
                                        ) : (
                                            <span className="inline-block px-2 py-0.5 text-sm font-bold rounded-md bg-blue-100 text-blue-800">
                                                {x.codigoAsiento}
                                            </span>
                                        )}
                                    </td>

                                    {/* Clase */}
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <select
                                                value={draft.claseId}
                                                onChange={(e) => setDraft((s) => ({ ...s, claseId: e.target.value }))}
                                                onKeyDown={(e) => onEditKeyDown(e, x.id)}
                                                className="w-full px-3 py-1 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 transition"
                                            >
                                                <option value="">-- clase --</option>
                                                {clases.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.nombre} (#{c.id})
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="text-gray-700">
                                                {x.clase?.nombre || 'N/A'} {x.clase?.id ? `(#${x.clase.id})` : ""}
                                            </span>
                                        )}
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {!isEditing ? (
                                            <>
                                                <button
                                                    onClick={() => startEdit(x.id)}
                                                    disabled={isDeleting}
                                                    className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(x.id)}
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
                                                    onClick={() => saveEdit(x.id)}
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
