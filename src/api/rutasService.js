import api from "./axiosConfig";

// Listar todas las rutas
export const listRutas = () => api.get("/rutas").then((r) => r.data);

// Crear ruta
export const createRuta = (payload) =>
  // payload: { origenId:Number, destinoId:Number, distanciaKm:Number }
  api.post("/rutas", payload).then((r) => r.data);

// Obtener una ruta por ID
export const getRuta = (id) => api.get(`/rutas/${id}`).then((r) => r.data);

// Actualizar una ruta por ID
export const updateRuta = (id, payload) =>
  // payload: { origenId:Number, destinoId:Number, distanciaKm:Number }
  api.put(`/rutas/${id}`, payload).then((r) => r.data);

// Eliminar una ruta por ID
export const deleteRuta = (id) => api.delete(`/rutas/${id}`);
