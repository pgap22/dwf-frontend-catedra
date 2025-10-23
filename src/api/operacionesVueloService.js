import api from "./axiosConfig";

// Listar operaciones
export const listOperaciones = () =>
  api.get("/operaciones-vuelo").then(r => r.data);

// Crear operación
// payload: {vueloId, avionId, fechaSalida, fechaLlegada, estado}
export const createOperacion = (payload) =>
  api.post("/operaciones-vuelo", payload).then(r => r.data);

// Obtener detalle
export const getOperacion = (id) =>
  api.get(`/operaciones-vuelo/${id}`).then(r => r.data);

// Eliminar
export const deleteOperacion = (id) =>
  api.delete(`/operaciones-vuelo/${id}`);
