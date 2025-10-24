import api from "./axiosConfig";

export const listUsuarios = (params) =>
  api.get("/usuarios", { params }).then((r) => r.data);
export const getUsuario = (id) =>
  api.get(`/usuarios/${id}`).then((r) => r.data);
export const createUsuario = (payload) =>
  api.post("/usuarios", payload).then((r) => r.data);
export const updateUsuario = (id, payload) =>
  api.put(`/usuarios/${id}`, payload).then((r) => r.data);
export const activarUsuario = (id) =>
  api.patch(`/usuarios/${id}/activar`).then((r) => r.data);
export const desactivarUsuario = (id) =>
  api.patch(`/usuarios/${id}/desactivar`).then((r) => r.data);
export const deleteUsuario = (id) =>
  api.delete(`/usuarios/${id}`).then((r) => r.data);
