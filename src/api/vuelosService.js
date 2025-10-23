import api from "./axiosConfig";

/**
 * Lista "vuelos" a partir de las operaciones de vuelo.
 * Devuelve un arreglo de objetos mínimos: [{ id, numeroVuelo }]
 * - id: intenta usar el id del Vuelo (si viene anidado en la Operación); si no, usa el id de la operación.
 * - numeroVuelo: toma op.vuelo.numeroVuelo; si no existe, usa un fallback "OP-{op.id}".
 */
export const listVuelos = async () => {
  // Traemos operaciones (ya existen en tu backend)
  const ops = await api.get("/operaciones-vuelo").then(r => r.data);

  // Dedupe por id de vuelo (si viene). Si no existe vuelo.id, dedup por numeroVuelo.
  const map = new Map();

  (Array.isArray(ops) ? ops : []).forEach(op => {
    const vueloId = op?.vuelo?.id ?? null;
    const numero = op?.vuelo?.numeroVuelo || (op?.id ? `OP-${op.id}` : "");

    // clave de dedupe: prioriza vueloId, si no hay usa numeroVuelo
    const key = vueloId != null ? `v-${vueloId}` : `n-${numero}`;

    if (!map.has(key)) {
      map.set(key, {
        id: vueloId != null ? vueloId : op?.id, // si no hay vueloId, usamos id de la operación como fallback
        numeroVuelo: numero,
      });
    }
  });

  return Array.from(map.values());
};
