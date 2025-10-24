import api from "./axiosConfig";

// ADMIN
export const listReclamosAdmin = () =>
  api.get("/reclamos").then(r => r.data);

// CLIENTE (ya los estabas usando)
export const getReclamosByReserva = (reservaId) =>
  api.get(`/reclamos/reserva/${reservaId}`).then(r => r.data);

export const getReclamosByPasajero = (pasajeroId) =>
  api.get(`/reclamos/pasajero/${pasajeroId}`).then(r => r.data);

export const getReclamo = (id) =>
  api.get(`/reclamos/${id}`).then(r => r.data);

export const createReclamo = (payload) =>
  api.post("/reclamos", payload).then(r => r.data);

// ADMIN
export const updateReclamoEstado = (id, payload) =>
  api.patch(`/reclamos/${id}/estado`, payload).then(r => r.data);
