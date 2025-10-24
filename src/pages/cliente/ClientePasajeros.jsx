import React, { useEffect, useMemo, useState } from "react";
import {
  listPasajeros,
  createPasajero,
  updatePasajero,
  deletePasajero,
} from "../../api/pasajerosService";

const emptyForm = {
  nombreCompleto: "",
  fechaNacimiento: "",
  nroPasaporte: "",
};

export default function ClientePasajeros() {
  const [pasajeros, setPasajeros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadPasajeros = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listPasajeros();
      setPasajeros(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "No se pudieron obtener los pasajeros."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPasajeros();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.nombreCompleto || !form.fechaNacimiento) {
      setError("Nombre y fecha de nacimiento son obligatorios.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombreCompleto: form.nombreCompleto.trim(),
        fechaNacimiento: form.fechaNacimiento,
        nroPasaporte: form.nroPasaporte?.trim() || null,
      };

      if (editId) {
        await updatePasajero(editId, payload);
        setSuccess("Pasajero actualizado correctamente.");
      } else {
        await createPasajero(payload);
        setSuccess("Pasajero registrado correctamente.");
      }

      resetForm();
      await loadPasajeros();
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Ocurrio un error al guardar el pasajero."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (pasajero) => {
    setEditId(pasajero.id);
    setForm({
      nombreCompleto: pasajero.nombreCompleto || "",
      fechaNacimiento: pasajero.fechaNacimiento || "",
      nroPasaporte: pasajero.nroPasaporte || "",
    });
    setSuccess("");
    setError("");
  };

  const handleDelete = async (id) => {
    const confirmar = window.confirm(
      "Desea eliminar este pasajero? Esta accion no se puede deshacer."
    );
    if (!confirmar) return;

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      await deletePasajero(id);
      setSuccess("Pasajero eliminado correctamente.");
      if (editId === id) {
        resetForm();
      }
      await loadPasajeros();
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "No se pudo eliminar el pasajero."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const tituloFormulario = useMemo(
    () => (editId ? "Editar pasajero" : "Registrar nuevo pasajero"),
    [editId]
  );

  const formatFecha = (value) => {
    if (!value) return "-";
    try {
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-gray-800">Mis pasajeros</h1>
        <p className="text-sm text-gray-500 mt-1">
          Administra la informacion de los pasajeros frecuentes para agilizar
          tus reservas.
        </p>
      </header>

      <section className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {tituloFormulario}
        </h2>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="nombreCompleto"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre completo
            </label>
            <input
              id="nombreCompleto"
              name="nombreCompleto"
              value={form.nombreCompleto}
              onChange={handleChange}
              required
              maxLength={150}
              className="block w-full md:w-1/2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
              placeholder="Ej. Juan Perez"
            />
          </div>

          <div>
            <label
              htmlFor="fechaNacimiento"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha de nacimiento
            </label>
            <input
              id="fechaNacimiento"
              name="fechaNacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={handleChange}
              required
              className="block w-full md:w-1/3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="nroPasaporte"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Numero de pasaporte (opcional)
            </label>
            <input
              id="nroPasaporte"
              name="nroPasaporte"
              value={form.nroPasaporte}
              onChange={handleChange}
              maxLength={30}
              className="block w-full md:w-1/3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
              placeholder="Ej. P1234567"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {saving ? "Guardando..." : editId ? "Actualizar" : "Guardar"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Cancelar edicion
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">
            Pasajeros registrados
          </h2>
        </div>

        {loading ? (
          <p className="px-6 py-4 text-sm text-gray-500">Cargando pasajeros...</p>
        ) : pasajeros.length === 0 ? (
          <p className="px-6 py-4 text-sm text-gray-500">
            No tienes pasajeros registrados. Utiliza el formulario superior para
            agregar uno nuevo.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de nacimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pasaporte
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pasajeros.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-3 text-sm text-gray-800">
                      {p.nombreCompleto}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {formatFecha(p.fechaNacimiento)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {p.nroPasaporte || "-"}
                    </td>
                    <td className="px-6 py-3 text-sm text-right space-x-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 focus:outline-none disabled:opacity-50"
                        disabled={deletingId === p.id}
                      >
                        {deletingId === p.id ? "Eliminando..." : "Eliminar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
