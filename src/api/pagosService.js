import api from "./axiosConfig";

export const listPagosAdmin = (params) =>
  api.get("/pagos", { params }).then((r) => r.data);
export const getPagosByReserva = (reservaId) =>
  api.get(`/pagos/reserva/${reservaId}`).then((r) => r.data);
export const getPago = (id) => api.get(`/pagos/${id}`).then((r) => r.data);
export const createPago = (payload) =>
  api.post("/pagos", payload).then((r) => r.data);
