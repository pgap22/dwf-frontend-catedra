import api from "./axiosConfig";

/**
 * GET /api/v1/estadisticas
 * Respuesta: {
 *   totalReservasActivas: number,
 *   totalReservasCanceladas: number,
 *   totalReservasCompletadas: number,
 *   totalCancelaciones: number
 * }
 */
export const getEstadisticas = () =>
  api.get("/estadisticas").then(r => r.data);
