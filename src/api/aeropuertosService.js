import api from "./axiosConfig";

export const listAeropuertos = () => api.get("/aeropuertos").then(r => r.data);
export const createAeropuerto = (payload) => api.post("/aeropuertos", payload).then(r => r.data);
export const getAeropuerto = (id) => api.get(`/aeropuertos/${id}`).then(r => r.data);
export const updateAeropuerto = (id, payload) => api.put(`/aeropuertos/${id}`, payload).then(r => r.data);
export const deleteAeropuerto = (id) => api.delete(`/aeropuertos/${id}`);
