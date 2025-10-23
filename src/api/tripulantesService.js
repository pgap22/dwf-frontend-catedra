import api from "./axiosConfig";

export const listTripulantes = () => api.get("/tripulantes").then(r => r.data);
export const createTripulante = (payload) => api.post("/tripulantes", payload).then(r => r.data);
export const getTripulante = (id) => api.get(`/tripulantes/${id}`).then(r => r.data);
export const updateTripulante = (id, payload) => api.put(`/tripulantes/${id}`, payload).then(r => r.data);
export const deleteTripulante = (id) => api.delete(`/tripulantes/${id}`);
