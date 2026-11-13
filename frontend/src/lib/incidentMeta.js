// Metadatos de dominio compartidos por todas las pantallas.

export const MALAGA_CENTER = [36.7213, -4.4214];

export const STATUSES = [
  ["REPORTED", "Recibida"],
  ["VALIDATED", "Validada"],
  ["ASSIGNED", "Asignada"],
  ["IN_PROGRESS", "En curso"],
  ["RESOLVED", "Resuelta"],
  ["CLOSED", "Cerrada"],
  ["REOPENED", "Reabierta"],
  ["REJECTED", "Rechazada"],
];
export const STATUS_LABEL = Object.fromEntries(STATUSES);

export const STATUS_HELP = {
  REPORTED: "Hemos recibido el aviso y está pendiente de revisión.",
  VALIDATED: "El equipo municipal ha revisado y confirmado la incidencia.",
  ASSIGNED: "Se ha asignado a un departamento para que la atienda.",
  IN_PROGRESS: "Se está trabajando en la reparación.",
  RESOLVED: "El problema se ha resuelto. Queda pendiente el cierre.",
  CLOSED: "La incidencia está cerrada.",
  REOPENED: "El problema ha vuelto a aparecer y se reabrió.",
  REJECTED: "No se ha podido tramitar como incidencia municipal.",
};

// Camino habitual de una incidencia (REOPENED y REJECTED son desvíos)
export const LIFECYCLE = ["REPORTED", "VALIDATED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export const OPEN_STATUSES = ["REPORTED", "VALIDATED", "ASSIGNED", "IN_PROGRESS", "REOPENED"];
export const DONE_STATUSES = ["RESOLVED", "CLOSED"];

export const CATEGORIES = [
  ["STREET", "Vía pública"],
  ["LIGHTING", "Alumbrado"],
  ["CLEANING", "Limpieza"],
  ["GREEN_AREAS", "Zonas verdes"],
  ["TRAFFIC_LIGHT", "Semáforos"],
  ["OTHER", "Otro"],
];
export const CATEGORY_LABEL = Object.fromEntries(CATEGORIES);
export const categoryLabel = (value) => CATEGORY_LABEL[value] || value || "Sin categoría";

const dateTime = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" });
const dateOnly = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" });
const relative = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

export function formatDateTime(value) {
  if (!value) return "Fecha pendiente";
  return dateTime.format(new Date(value));
}

export function formatDate(value) {
  if (!value) return "Fecha pendiente";
  return dateOnly.format(new Date(value));
}

export function relativeTime(value) {
  if (!value) return "";
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const steps = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "ahora mismo";
}

export const shortRef = (id) => (id ? String(id).slice(0, 8).toUpperCase() : "");

// El histórico GECOR llega con la dirección, prioridad y fecha de alta dentro de `description`.
export function parseGecorDescription(description = "") {
  const parts = description.split(" · ").map((part) => part.trim()).filter(Boolean);
  const result = { type: "", address: "", priority: "", registered: "" };
  const rest = [];
  parts.forEach((part) => {
    if (part.startsWith("Prioridad:")) result.priority = part.replace("Prioridad:", "").trim();
    else if (part.startsWith("Registrada:")) result.registered = part.replace("Registrada:", "").trim();
    else rest.push(part);
  });
  [result.type, result.address] = [rest[0] || "", rest[1] || ""];
  return result;
}
