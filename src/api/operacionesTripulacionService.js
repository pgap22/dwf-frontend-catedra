import api from "./axiosConfig";

// Asignar tripulante a operación
// payload: { operacionId, tripulanteId, rolEnVuelo }
export const asignarTripulante = (payload) =>
  api.post("/operaciones-tripulacion", payload).then(r => r.data);

// Desasignar (por id de la asignación)
export const desasignarTripulante = (id) =>
  api.delete(`/operaciones-tripulacion/${id}`);

// ✔ NUEVO: listar asignaciones por operación de vuelo
export const listAsignacionesByOperacion = (operacionId) =>
  api
    .get(`/operaciones-tripulacion/operacion-vuelo/${operacionId}`)
    .then(r => r.data);