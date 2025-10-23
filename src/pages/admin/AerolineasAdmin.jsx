import React, { useEffect, useState, useRef } from "react";
import {
  listAerolineas,
  createAerolinea,
  getAerolinea,
  updateAerolinea,
  deleteAerolinea,
} from "../../api/aerolineasService";

export default function AerolineasAdmin() {
  // listado
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // creación (fila superior)
  const [newRow, setNewRow] = useState({ nombre: "", codigoIata: "" });
  const [creating, setCreating] = useState(false);

  // edición por fila
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ nombre: "", codigoIata: "" });
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // feedback simple
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const nombreInputRef = useRef(null);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listAerolineas();
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

  // helpers
  const normalizeIata = (s) => (s || "").toUpperCase().trim();
  const validIata = (s) => {
    const x = normalizeIata(s);
    return x.length >= 2 && x.length <= 3 && /^[A-Z]+$/.test(x);
  };

  // creación
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const payload = {
      nombre: newRow.nombre.trim(),
      codigoIata: normalizeIata(newRow.codigoIata),
    };
    if (!payload.nombre) return setError("Nombre requerido.");
    if (!validIata(payload.codigoIata)) return setError("Código IATA inválido (2–3 letras).");

    setCreating(true);
    try {
      await createAerolinea(payload);
      setNewRow({ nombre: "", codigoIata: "" });
      setInfo("Aerolínea creada.");
      await refresh();
    } catch (e) {
      setError("No se pudo crear la aerolínea.");
    } finally {
      setCreating(false);
    }
  };

  // edición
  const startEdit = async (id) => {
    if (editingId === id) return;
    setError("");
    setInfo("");
    setSavingId(null);

    try {
      const data = await getAerolinea(id);
      setEditingId(id);
      setDraft({
        nombre: data?.nombre || "",
        codigoIata: data?.codigoIata || "",
      });
      // foco amigable
      setTimeout(() => {
        nombreInputRef.current?.focus();
      }, 0);
    } catch (e) {
      setError("No se pudo obtener el detalle.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ nombre: "", codigoIata: "" });
  };

  const saveEdit = async (id) => {
    setError("");
    setInfo("");
    const payload = {
      nombre: draft.nombre.trim(),
      codigoIata: normalizeIata(draft.codigoIata),
    };
    if (!payload.nombre) return setError("Nombre requerido.");
    if (!validIata(payload.codigoIata)) return setError("Código IATA inválido (2–3 letras).");

    setSavingId(id);
    try {
      await updateAerolinea(id, payload);
      setInfo("Aerolínea actualizada.");
      setEditingId(null);
      await refresh();
    } catch (e) {
      setError("No se pudo actualizar.");
    } finally {
      setSavingId(null);
    }
  };

  // eliminar
  const handleDelete = async (id) => {
    const ok = window.confirm("¿Eliminar esta aerolínea?");
    if (!ok) return;

    setError("");
    setInfo("");
    setDeletingId(id);
    try {
      await deleteAerolinea(id);
      setInfo("Aerolínea eliminada.");
      if (editingId === id) cancelEdit();
      await refresh();
    } catch (e) {
      setError("No se pudo eliminar.");
    } finally {
      setDeletingId(null);
    }
  };

  // teclado en edición (Enter/ESC)
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
      <h3 className="text-3xl font-bold text-gray-800 border-b pb-2">
        Gestión de Aerolíneas ✈️
      </h3>

      {/* Control y Mensajes */}
      <div className="flex justify-between items-center">
        <button
          onClick={refresh}
          disabled={loading}
          className={`px-5 py-2 rounded-lg font-medium transition duration-200 ${loading
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
            }`}
        >
          {loading ? "Cargando..." : "Recargar Listado"}
        </button>
      </div>

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
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-40">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Código IATA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                Acciones
              </th>
            </tr>
            {/* Fila de Creación (Sticky en la parte superior si la tabla fuera muy larga) */}
            <tr className="bg-blue-50 border-b border-blue-200">
              <td className="px-6 py-3 text-sm text-gray-500 font-semibold">
                Nuevo
              </td>
              <td>
                <input
                  placeholder="Nombre"
                  value={newRow.nombre}
                  onChange={(e) => setNewRow((s) => ({ ...s, nombre: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                />
              </td>
              <td>
                <input
                  placeholder="IATA (2–3)"
                  value={newRow.codigoIata}
                  onChange={(e) =>
                    setNewRow((s) => ({ ...s, codigoIata: e.target.value.toUpperCase() }))
                  }
                  maxLength={3}
                  className="w-full px-3 py-1.5 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                />
              </td>
              <td>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className={`ml-2 px-3 py-1 text-sm rounded-md font-semibold transition duration-200 ${creating
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
            {items.length === 0 && !loading ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-500">
                  No hay aerolíneas registradas.
                </td>
              </tr>
            ) : null}

            {items.map((a) => {
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

                  {/* Nombre */}
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        ref={nombreInputRef}
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

                  {/* Código IATA */}
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        value={draft.codigoIata}
                        onChange={(e) =>
                          setDraft((s) => ({ ...s, codigoIata: e.target.value.toUpperCase() }))
                        }
                        onKeyDown={(e) => onEditKeyDown(e, a.id)}
                        placeholder="IATA (2–3)"
                        maxLength={3}
                        className="w-full px-3 py-1 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 transition"
                      />
                    ) : (
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {a.codigoIata}
                      </span>
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
                          {isDeleting ? "Eliminando..." : "Eliminar"}
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
                          {isSaving ? "Guardando..." : "Guardar"}
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
