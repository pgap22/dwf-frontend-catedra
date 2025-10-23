import api from "./axiosConfig";

// Listar tarifas por operación
export const listTarifasByOperacion = (operacionId) =>
  api.get(`/tarifas-operacion/operacion/${operacionId}`).then(r => r.data);

// Asignar tarifa a operación
// payload: { operacionId, tarifaId, precio, asientosDisponibles }
export const createTarifaOperacion = (payload) =>
  api.post("/tarifas-operacion", payload).then(r => r.data);

// Obtener/Actualizar/Eliminar tarifa de operación por id
export const getTarifaOperacion = (id) =>
  api.get(`/tarifas-operacion/${id}`).then(r => r.data);

export const updateTarifaOperacion = (id, payload) =>
  api.put(`/tarifas-operacion/${id}`, payload).then(r => r.data);

export const deleteTarifaOperacion = (id) =>
  api.delete(`/tarifas-operacion/${id}`);
