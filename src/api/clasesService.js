import api from "./axiosConfig";

export const listClases = () => api.get("/clases").then(r => r.data);
export const createClase = (payload) => api.post("/clases", payload).then(r => r.data);
export const getClase = (id) => api.get(`/clases/${id}`).then(r => r.data);
export const updateClase = (id, payload) => api.put(`/clases/${id}`, payload).then(r => r.data);
export const deleteClase = (id) => api.delete(`/clases/${id}`);
