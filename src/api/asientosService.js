import api from "./axiosConfig";

export const createAsiento = (payload) => api.post("/asientos-avion", payload).then(r => r.data);
export const listAsientosPorAvion = (avionId) => api.get(`/asientos-avion/avion/${avionId}`).then(r => r.data);
export const getAsiento = (id) => api.get(`/asientos-avion/${id}`).then(r => r.data);
export const updateAsiento = (id, payload) => api.put(`/asientos-avion/${id}`, payload).then(r => r.data);
export const deleteAsiento = (id) => api.delete(`/asientos-avion/${id}`);
