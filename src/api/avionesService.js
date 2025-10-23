import api from "./axiosConfig";

export const listAviones = () => api.get("/aviones").then(r => r.data);
export const createAvion = (payload) => api.post("/aviones", payload).then(r => r.data);
export const getAvion = (id) => api.get(`/aviones/${id}`).then(r => r.data);
export const updateAvion = (id, payload) => api.put(`/aviones/${id}`, payload).then(r => r.data);
export const deleteAvion = (id) => api.delete(`/aviones/${id}`);
