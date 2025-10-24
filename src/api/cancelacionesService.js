import api from "./axiosConfig";

export const listCancelacionesAdmin = (params) =>
  api.get("/cancelaciones", { params }).then((r) => r.data);
export const getCancelacion = (id) =>
  api.get(`/cancelaciones/${id}`).then((r) => r.data);
export const getCancelacionByReserva = (reservaId) =>
  api.get(`/cancelaciones/reserva/${reservaId}`).then((r) => r.data);
export const createCancelacion = (payload) =>
  api.post("/cancelaciones", payload).then((r) => r.data);
