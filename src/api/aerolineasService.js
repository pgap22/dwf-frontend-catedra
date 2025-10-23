import api from "./axiosConfig";

export const listAerolineas = () => api.get("/aerolineas").then(r => r.data);
export const createAerolinea = (payload) => api.post("/aerolineas", payload).then(r => r.data);
export const getAerolinea = (id) => api.get(`/aerolineas/${id}`).then(r => r.data);
export const updateAerolinea = (id, payload) => api.put(`/aerolineas/${id}`, payload).then(r => r.data);
export const deleteAerolinea = (id) => api.delete(`/aerolineas/${id}`);
