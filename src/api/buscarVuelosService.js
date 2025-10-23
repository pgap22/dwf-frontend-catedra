import api from "./axiosConfig";

// params: { origenId, destinoId, fechaSalida: "YYYY-MM-DD" }
export const buscarVuelos = (params) =>
  api.get("/operaciones-vuelo/buscar", { params: { params } }).then(r => r.data);
