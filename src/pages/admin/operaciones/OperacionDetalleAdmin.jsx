import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getOperacion } from "../../../api/operacionesVueloService";
import {
    listTarifasByOperacion,
    createTarifaOperacion,
    updateTarifaOperacion,
    deleteTarifaOperacion,
} from "../../../api/tarifasOperacionService";
import { listTarifas } from "../../../api/tarifasService";
import {
    asignarTripulante,
    desasignarTripulante,
    listAsignacionesByOperacion, // 👈 IMPORTA AQUÍ
} from "../../../api/operacionesTripulacionService";
import { listTripulantes } from "../../../api/tripulantesService";

const getEstadoClasses = (estado) => {
  switch (estado) {
    case 'ARRIBADO': return 'bg-green-100 text-green-800';
    case 'EN_VUELO': return 'bg-blue-100 text-blue-800';
    case 'PROGRAMADO': return 'bg-indigo-100 text-indigo-800';
    case 'CANCELADO': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default function OperacionDetalleAdmin() {
    const { id } = useParams();

    // Operación
    const [op, setOp] = useState(null);
    const [loadingOp, setLoadingOp] = useState(false);

    // Tarifas
    const [tarifasBase, setTarifasBase] = useState([]);
    const [tOp, setTOp] = useState([]);
    const [creatingTar, setCreatingTar] = useState(false);
    const [newTar, setNewTar] = useState({ tarifaId: "", precio: "", asientosDisponibles: "" });
    const [editingTarId, setEditingTarId] = useState(null);
    const [draftTar, setDraftTar] = useState({ precio: "", asientosDisponibles: "" });
    const [savingTarId, setSavingTarId] = useState(null);
    const [deletingTarId, setDeletingTarId] = useState(null);

    // Tripulación
    const [tripulantes, setTripulantes] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]); // 👈 NUEVO
    const [newCrew, setNewCrew] = useState({ tripulanteId: "", rolEnVuelo: "" });
    const [assigning, setAssigning] = useState(false);
    const [unassigningId, setUnassigningId] = useState(null);

    // Mensajes
    const [err, setErr] = useState("");
    const [info, setInfo] = useState("");

    const precioRef = useRef(null);

    const loadAll = async () => {
        setErr(""); setInfo("");
        setLoadingOp(true);
        try {
            const [o, base, porOp, crew, asigns] = await Promise.allSettled([
                getOperacion(id),
                listTarifas(),
                listTarifasByOperacion(id),
                listTripulantes(),
                listAsignacionesByOperacion(id), // 👈 NUEVO
            ]);
            if (o.status === "fulfilled") setOp(o.value || null);
            if (base.status === "fulfilled") setTarifasBase(Array.isArray(base.value) ? base.value : []);
            if (porOp.status === "fulfilled") setTOp(Array.isArray(porOp.value) ? porOp.value : []);
            if (crew.status === "fulfilled") setTripulantes(Array.isArray(crew.value) ? crew.value : []);
            if (asigns.status === "fulfilled") setAsignaciones(Array.isArray(asigns.value) ? asigns.value : []); // 👈
        } catch {
            setErr("No se pudo cargar el detalle.");
        } finally {
            setLoadingOp(false);
        }
    };

    useEffect(() => { loadAll(); }, [id]);

    // ----- Tarifas (igual que ya tenías) -----
    const createTar = async () => {
        setErr(""); setInfo("");
        if (!newTar.tarifaId || !newTar.precio || !newTar.asientosDisponibles) {
            return alert("Completa tarifa, precio y asientos.");
        }
        setCreatingTar(true);
        try {
            await createTarifaOperacion({
                operacionId: Number(id),
                tarifaId: Number(newTar.tarifaId),
                precio: Number(newTar.precio),
                asientosDisponibles: Number(newTar.asientosDisponibles),
            });
            setNewTar({ tarifaId: "", precio: "", asientosDisponibles: "" });
            setInfo("Tarifa creada.");
            await loadAll();
        } catch {
            setErr("No se pudo crear la tarifa.");
        } finally {
            setCreatingTar(false);
        }
    };

    const startEditTar = (t) => {
        setEditingTarId(t.id);
        setDraftTar({
            precio: String(t.precio ?? ""),
            asientosDisponibles: String(t.asientosDisponibles ?? ""),
        });
        setTimeout(() => precioRef.current?.focus(), 0);
    };

    const saveTar = async (tarId) => {
        setErr(""); setInfo("");
        const precio = Number(draftTar.precio);
        const seats = Number(draftTar.asientosDisponibles);
        if (Number.isNaN(precio) || Number.isNaN(seats)) return alert("Precio y asientos deben ser numéricos.");
        setSavingTarId(tarId);
        try {
            const current = tOp.find((x) => String(x.id) === String(tarId));
            const tarifaBaseId = current?.tarifa?.id;
            await updateTarifaOperacion(tarId, {
                operacionId: Number(id),
                tarifaId: Number(tarifaBaseId),
                precio,
                asientosDisponibles: seats,
            });
            setEditingTarId(null);
            setInfo("Tarifa actualizada.");
            await loadAll();
        } catch {
            setErr("No se pudo actualizar la tarifa.");
        } finally {
            setSavingTarId(null);
        }
    };

    const deleteTar = async (tarId) => {
        const ok = window.confirm("¿Eliminar esta tarifa de la operación?");
        if (!ok) return;
        setDeletingTarId(tarId);
        try {
            await deleteTarifaOperacion(tarId);
            setInfo("Tarifa eliminada.");
            await loadAll();
        } catch {
            setErr("No se pudo eliminar la tarifa.");
        } finally {
            setDeletingTarId(null);
        }
    };

    // ----- Tripulación (ahora refresca usando listAsignacionesByOperacion) -----
    const assignCrew = async () => {
        setErr(""); setInfo("");
        if (!newCrew.tripulanteId || !newCrew.rolEnVuelo) return alert("Selecciona tripulante y escribe un rol.");
        setAssigning(true);
        try {
            await asignarTripulante({
                operacionId: Number(id),
                tripulanteId: Number(newCrew.tripulanteId),
                rolEnVuelo: newCrew.rolEnVuelo.trim(),
            });
            setNewCrew({ tripulanteId: "", rolEnVuelo: "" });
            setInfo("Tripulante asignado.");
            // 👇 refresca SOLO asignaciones (si quieres ahorrar llamadas)
            const data = await listAsignacionesByOperacion(id);
            setAsignaciones(Array.isArray(data) ? data : []);
        } catch {
            setErr("No se pudo asignar el tripulante.");
        } finally {
            setAssigning(false);
        }
    };

    const unassignCrew = async (asignacionId) => {
        const ok = window.confirm("¿Quitar este tripulante?");
        if (!ok) return;
        setUnassigningId(asignacionId);
        try {
            await desasignarTripulante(asignacionId);
            setInfo("Tripulante removido.");
            const data = await listAsignacionesByOperacion(id);
            setAsignaciones(Array.isArray(data) ? data : []);
        } catch {
            setErr("No se pudo quitar el tripulante.");
        } finally {
            setUnassigningId(null);
        }
    };

    return (
        <div className="space-y-6 p-4">
            <h3 className="text-3xl font-bold text-gray-800 border-b pb-2 mb-6">
                Detalle de Operación #{id} 📋
            </h3>

            {/* Mensajes de Estado */}
            {err && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    Error: {err}
                </div>
            )}
            {info && (
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    Info: {info}
                </div>
            )}

            {/* Loader y Tarjeta de Información General */}
            {loadingOp && !op ? (
                <div className="p-6 bg-white rounded-xl shadow-lg text-blue-600 font-semibold">
                    Cargando detalles de la operación...
                </div>
            ) : op ? (
                <section className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500 space-y-3">
                    <h4 className="text-xl font-semibold text-gray-800 mb-4">Información del Vuelo</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <p className="col-span-1">
                            <b className="font-semibold text-gray-600">Vuelo:</b>{" "}
                            <span className="text-lg font-bold block text-blue-700">{op?.vuelo?.numeroVuelo || "—"}</span>
                        </p>
                        <p className="col-span-1">
                            <b className="font-semibold text-gray-600">Avión:</b>{" "}
                            <span className="text-gray-900 font-medium block">
                                {op?.avion?.matricula || "—"}{" "}
                                {op?.avion?.modelo ? `(${op.avion.modelo})` : ""}
                            </span>
                        </p>
                        <p className="col-span-1">
                            <b className="font-semibold text-gray-600">Salida:</b>{" "}
                            <span className="text-gray-900 font-medium block">
                                {op?.fechaSalida ? new Date(op.fechaSalida).toLocaleString() : "—"}
                            </span>
                        </p>
                        <p className="col-span-1">
                            <b className="font-semibold text-gray-600">Llegada:</b>{" "}
                            <span className="text-gray-900 font-medium block">
                                {op?.fechaLlegada ? new Date(op.fechaLlegada).toLocaleString() : "—"}
                            </span>
                        </p>
                        <p className="col-span-1">
                            <b className="font-semibold text-gray-600">Estado:</b>{" "}
                            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${getEstadoClasses(op?.estado)} block mt-1`}>
                                {op?.estado?.replace('_', ' ') || "—"}
                            </span>
                        </p>
                    </div>
                </section>
            ) : null}

            {/* Contenedor de Sub-gestiones (Tarifas y Tripulación) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

                {/* ======================= GESTIÓN DE TARIFAS (COLUMNA 1) ======================= */}
                <section className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
                    <h4 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                        Tarifas por Operación 🏷️
                    </h4>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">ID</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-40">Tarifa Base / Clase</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Precio</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Asientos Disp.</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Acciones</th>
                                </tr>

                                {/* Fila de Creación */}
                                <tr className="bg-yellow-50 border-b border-yellow-200">
                                    <td className="px-3 py-2 text-sm text-gray-500 font-semibold">—</td>
                                    <td>
                                        <select
                                            value={newTar.tarifaId}
                                            onChange={(e) => setNewTar((s) => ({ ...s, tarifaId: e.target.value }))}
                                            className="w-full px-2 py-1 border border-yellow-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-xs"
                                        >
                                            <option value="">-- tarifa --</option>
                                            {tarifasBase.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.codigo} / {t?.clase?.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            placeholder="Precio"
                                            value={newTar.precio}
                                            onChange={(e) => setNewTar((s) => ({ ...s, precio: e.target.value }))}
                                            className="w-full px-2 py-1 border border-yellow-300 rounded-md text-xs"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            placeholder="Asientos"
                                            value={newTar.asientosDisponibles}
                                            onChange={(e) =>
                                                setNewTar((s) => ({ ...s, asientosDisponibles: e.target.value }))
                                            }
                                            className="w-full px-2 py-1 border border-yellow-300 rounded-md text-xs"
                                        />
                                    </td>
                                    <td>
                                        <button
                                            onClick={createTar}
                                            disabled={creatingTar}
                                            className={`px-3 py-1 text-xs rounded-md font-semibold transition duration-200 ${creatingTar ? "bg-green-300 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"
                                                }`}
                                        >
                                            {creatingTar ? "Guardando..." : "Crear"}
                                        </button>
                                    </td>
                                </tr>
                            </thead>

                            <tbody>
                                {tOp.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-gray-500 text-sm">Sin tarifas asignadas.</td>
                                    </tr>
                                ) : (
                                    tOp.map((t) => {
                                        const editing = editingTarId === t.id;
                                        const saving = savingTarId === t.id;
                                        const deleting = deletingTarId === t.id;
                                        return (
                                            <tr key={t.id} className={editing ? 'bg-yellow-100 hover:bg-yellow-200' : 'hover:bg-gray-50'}>
                                                <td className="px-3 py-2 text-sm text-gray-900">{t.id}</td>
                                                <td className="px-3 py-2 text-sm font-medium text-gray-700">
                                                    {t?.tarifa?.codigo} / <span className="text-blue-600">{t?.tarifa?.clase?.nombre}</span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900">
                                                    {editing ? (
                                                        <input
                                                            ref={precioRef}
                                                            type="number"
                                                            value={draftTar.precio}
                                                            onChange={(e) => setDraftTar((s) => ({ ...s, precio: e.target.value }))}
                                                            className="w-full px-2 py-1 border border-yellow-400 rounded-md text-sm"
                                                        />
                                                    ) : (
                                                        <span className="font-semibold">${parseFloat(t.precio).toFixed(2)}</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900">
                                                    {editing ? (
                                                        <input
                                                            type="number"
                                                            value={draftTar.asientosDisponibles}
                                                            onChange={(e) =>
                                                                setDraftTar((s) => ({ ...s, asientosDisponibles: e.target.value }))
                                                            }
                                                            className="w-full px-2 py-1 border border-yellow-400 rounded-md text-sm"
                                                        />
                                                    ) : (
                                                        t.asientosDisponibles
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm space-x-2">
                                                    {!editing ? (
                                                        <>
                                                            <button onClick={() => startEditTar(t)} disabled={deleting} className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400">Editar</button>
                                                            <button onClick={() => deleteTar(t.id)} disabled={deleting} className={`text-red-600 hover:text-red-900 ${deleting ? 'opacity-50' : ''}`}>
                                                                {deleting ? "Eliminando" : "Eliminar"}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => saveTar(t.id)} disabled={saving} className={`px-2 py-1 text-xs rounded-md font-semibold ${saving ? 'bg-green-300' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                                                                {saving ? "Guardando" : "Guardar"}
                                                            </button>
                                                            <button onClick={() => setEditingTarId(null)} disabled={saving} className="px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300">
                                                                Cancelar
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ======================= GESTIÓN DE TRIPULACIÓN (COLUMNA 2) ======================= */}
                <section className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
                    <h4 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                        Tripulación Asignada 🧑‍✈️
                    </h4>

                    {/* Formulario de Asignación */}
                    <div className="flex flex-col space-y-3 mb-6 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <select
                            value={newCrew.tripulanteId}
                            onChange={(e) => setNewCrew((s) => ({ ...s, tripulanteId: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-indigo-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        >
                            <option value="">-- seleccionar tripulante --</option>
                            {tripulantes.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.nombre} ({t.tipo})
                                </option>
                            ))}
                        </select>
                        <input
                            placeholder="Rol en vuelo (ej. PILOTO, SOBRECARGO)"
                            value={newCrew.rolEnVuelo}
                            onChange={(e) => setNewCrew((s) => ({ ...s, rolEnVuelo: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-indigo-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                        <button
                            onClick={assignCrew}
                            disabled={assigning}
                            className={`w-full px-3 py-1.5 text-sm rounded-md font-semibold transition duration-200 ${assigning ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"
                                }`}
                        >
                            {assigning ? "Asignando..." : "Asignar Tripulante"}
                        </button>
                    </div>

                    {/* Listado de Tripulación Asignada */}
                    <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                        {Array.isArray(asignaciones) && asignaciones.length > 0 ? (
                            asignaciones.map((a) => (
                                <li key={a.id} className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 transition">
                                    <div className="text-sm">
                                        <span className="font-medium text-gray-900">{a?.tripulante?.nombre || 'N/A'}</span>
                                        <span className="text-xs text-gray-500 block">
                                            Rol: <span className="font-semibold text-indigo-700">{a?.rolEnVuelo || '—'}</span>
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => unassignCrew(a.id)}
                                        disabled={unassigningId === a.id}
                                        className={`px-3 py-1 text-xs rounded-md font-semibold transition duration-200 ${unassigningId === a.id ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'
                                            }`}
                                    >
                                        {unassigningId === a.id ? "Quitando" : "Quitar"}
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="p-4 text-center text-gray-500 text-sm">Sin tripulación asignada.</li>
                        )}
                    </ul>
                </section>
            </div>
        </div>
    );
}
