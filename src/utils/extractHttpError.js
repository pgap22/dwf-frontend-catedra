// utils/httpError.js
function humanizeField(key) {
  // asientosDisponibles -> Asientos disponibles
  return String(key)
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function normalizeDetails(details) {
  if (!details) return "";

  // details como array de strings
  if (Array.isArray(details)) {
    return details.join(", ");
  }

  // details como objeto { campo: "mensaje", ... }
  if (typeof details === "object") {
    return Object.entries(details)
      .map(([field, val]) => {
        const label = humanizeField(field);
        if (typeof val === "string") return `${label}: ${val}`;
        if (Array.isArray(val)) return `${label}: ${val.join(", ")}`;
        if (val && typeof val === "object")
          return `${label}: ${JSON.stringify(val)}`;
        return `${label}: ${String(val)}`;
      })
      .join("; ");
  }

  // string u otros tipos
  return String(details);
}

export function extractHttpError(err) {
  const data = err?.response?.data;
  const status = err?.response?.status;

  let msg = "";

  if (typeof data === "string") {
    msg = data;
  } else if (Array.isArray(data)) {
    msg = data.join(", ");
  } else if (data && typeof data === "object") {
    if (data.details) {
      // prioridad: message -> details -> error/title
      const det = normalizeDetails(data.details);
      msg = det || msg;
    } else if (typeof data.message === "string" && data.message.trim()) {
      msg = data.message.trim();
    } else if (typeof data.error === "string") {
      msg = data.error;
    } else if (typeof data.title === "string") {
      msg = data.title;
    } else {
      // último recurso: stringify todo el objeto si no hay nada legible
      msg = JSON.stringify(data);
    }
  }

  if (!msg && err?.request && !err?.response) {
    msg = "No hay respuesta del servidor. Verifica la conexión.";
  }
  if (!msg && err?.code === "ECONNABORTED") {
    msg = "La solicitud expiró (timeout).";
  }
  if (!msg && typeof err?.message === "string") {
    msg = err.message;
  }
  if (!msg) msg = "Ocurrió un error inesperado.";

  return { message: msg, status, data };
}
