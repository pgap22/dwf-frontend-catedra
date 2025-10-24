import api from "./axiosConfig";

// CLIENTE
export const listMisReservas = () =>
  api.get("/reservas/mis-reservas").then(r => r.data);

export const getReservaByCodigo = (codigo) =>
  api.get(`/reservas/${codigo}`).then(r => r.data);

// Crear reserva (POST /reservas)
// payload: { operacionVueloId, items: [{ pasajeroId, tarifaOperacionId, asientoAvionId? }] }
export const createReserva = (payload) =>
  api.post("/reservas", payload).then(r => r.data);

// Modificar por código (PATCH /reservas/{codigo})
// body: { cambios: [{ reservaAsientoId, pasajeroId?, asientoAvionId?, tarifaOperacionId? }] }
export const patchReservaByCodigo = (codigo, body) =>
  api.patch(`/reservas/${codigo}`, body).then(r => r.data);

// ADMIN
// GET /reservas?{page,size,sort,direction,estado,fechaDesde,fechaHasta,aerolineaId,origenId,destinoId}
export const listReservasAdmin = (params) =>
  api.get("/reservas", { params }).then(r => r.data);
