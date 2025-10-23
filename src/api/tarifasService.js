import api from "./axiosConfig";

export const listTarifas = () => api.get("/tarifas").then(r => r.data);
export const createTarifa = (payload) => api.post("/tarifas", payload).then(r => r.data);
export const getTarifa = (id) => api.get(`/tarifas/${id}`).then(r => r.data);
export const updateTarifa = (id, payload) => api.put(`/tarifas/${id}`, payload).then(r => r.data);
export const deleteTarifa = (id) => api.delete(`/tarifas/${id}`);
