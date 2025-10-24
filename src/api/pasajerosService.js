import api from "./axiosConfig";

export const listPasajeros = () =>
  api.get("/pasajeros").then((r) => r.data);

export const getPasajero = (id) =>
  api.get(`/pasajeros/${id}`).then((r) => r.data);

export const createPasajero = (payload) =>
  api.post("/pasajeros", payload).then((r) => r.data);

export const updatePasajero = (id, payload) =>
  api.put(`/pasajeros/${id}`, payload).then((r) => r.data);

export const deletePasajero = (id) =>
  api.delete(`/pasajeros/${id}`);
