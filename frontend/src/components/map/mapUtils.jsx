import L from "leaflet";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { CATEGORIES } from "../../lib/incidentMeta.js";
import { categoryIcon } from "../ui/icons.jsx";

export const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const iconCache = new Map();

// Los glifos SVG de cada categoría se generan una sola vez al cargar el módulo
// (fuera del ciclo de render) para incrustarlos en los marcadores de Leaflet.
function glyphMarkup(Glyph) {
  const holder = document.createElement("div");
  const root = createRoot(holder);
  flushSync(() => root.render(<Glyph size={17} strokeWidth={2.2} aria-hidden="true" />));
  const html = holder.innerHTML;
  root.unmount();
  return html;
}
const GLYPHS = Object.fromEntries([...CATEGORIES.map(([value]) => value), "__default"].map((key) => [key, glyphMarkup(categoryIcon(key))]));

/** Marcador de incidencia: color = estado, glifo = categoría. */
export function incidentIcon(status, category, selected = false) {
  const key = `${status}|${category}|${selected}`;
  if (iconCache.has(key)) return iconCache.get(key);
  const glyph = GLYPHS[category] || GLYPHS.__default;
  const icon = L.divIcon({
    className: "up-pin-wrap",
    html: `<div class="up-pin status-${String(status).toLowerCase()} ${selected ? "is-selected" : ""}"><span class="up-pin-badge">${glyph}</span></div>`,
    iconSize: [40, 48],
    iconAnchor: [20, 46],
  });
  iconCache.set(key, icon);
  return icon;
}

/** Punto del histórico: disco del color del grupo de categoría con su glifo (sin "cola": ya está resuelto). */
export function historicIcon(group, selected = false) {
  const key = `historic|${group}|${selected}`;
  if (iconCache.has(key)) return iconCache.get(key);
  const glyph = GLYPHS[group] || GLYPHS.__default;
  const icon = L.divIcon({
    className: "up-dot-wrap",
    html: `<div class="up-dot cat-${group.toLowerCase()} ${selected ? "is-selected" : ""}">${glyph}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
  iconCache.set(key, icon);
  return icon;
}

export function clusterIcon(count) {
  const size = count > 99 ? 54 : count > 19 ? 46 : 38;
  return L.divIcon({
    className: "up-cluster-wrap",
    html: `<div class="up-cluster" style="width:${size}px;height:${size}px"><span>${count.toLocaleString("es-ES")}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/**
 * Agrupa elementos visibles en una cuadrícula de píxeles. Devuelve cubos con su centro;
 * los cubos de un solo elemento se pintan como marcador individual.
 */
export function bucketByGrid(map, items, getLatLng, { cellSize = 56, skip } = {}) {
  const zoom = map.getZoom();
  // En el zoom máximo ya no se puede acercar más: los grupos se abren en abanico en vez de agruparse
  const atMaxZoom = zoom >= map.getMaxZoom();
  const visible = map.getBounds().pad(0.1);
  const buckets = new Map();
  const singles = [];
  items.forEach((item) => {
    const [lat, lng] = getLatLng(item);
    if (skip && skip(item)) { singles.push({ items: [item], center: [lat, lng] }); return; }
    if (!visible.contains([lat, lng])) return;
    const pixel = map.project([lat, lng], zoom);
    const key = `${Math.floor(pixel.x / cellSize)}:${Math.floor(pixel.y / cellSize)}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(item);
  });
  const result = [...singles];
  buckets.forEach((bucket) => {
    const total = bucket.reduce((sum, item) => {
      const [lat, lng] = getLatLng(item);
      return [sum[0] + lat, sum[1] + lng];
    }, [0, 0]);
    const center = [total[0] / bucket.length, total[1] / bucket.length];
    if (atMaxZoom && bucket.length > 1) result.push(...spreadBucket(map, bucket, center, zoom));
    else result.push({ items: bucket, center });
  });
  return result;
}

/**
 * Reparte los elementos de un grupo alrededor de su centro (círculo para pocos, espiral para muchos).
 * Cada elemento conserva `origin` para dibujar una línea guía hasta su posición real.
 */
function spreadBucket(map, items, center, zoom) {
  const origin = map.project(center, zoom);
  const place = (offsetX, offsetY, item) => ({ items: [item], center: map.unproject(origin.add([offsetX, offsetY]), zoom), origin: center });
  if (items.length <= 9) {
    const radius = Math.max(30, (items.length * 34) / (2 * Math.PI));
    return items.map((item, index) => {
      const angle = (index / items.length) * 2 * Math.PI - Math.PI / 2;
      return place(radius * Math.cos(angle), radius * Math.sin(angle), item);
    });
  }
  let angle = 0;
  let length = 26;
  return items.map((item, index) => {
    angle += 32 / length + index * 0.0005;
    const spot = place(length * Math.cos(angle), length * Math.sin(angle), item);
    length += (2 * Math.PI * 6) / angle;
    return spot;
  });
}

/** Línea fina entre la posición real de un grupo abierto y cada elemento repartido. */
export function spreadLeg(bucket) {
  return L.polyline([bucket.origin, bucket.center], { color: "#5b6f6c", weight: 1.25, opacity: 0.7, interactive: false });
}

export function zoomToBucket(map, bucket, getLatLng) {
  const bounds = L.latLngBounds(bucket.items.map(getLatLng));
  const maxZoom = map.getMaxZoom();
  // Puntos (casi) superpuestos: se salta directamente al zoom máximo, donde el grupo se abre
  const fitZoom = map.getBoundsZoom(bounds, false, L.point(120, 120));
  if (bounds.getNorthEast().equals(bounds.getSouthWest()) || fitZoom >= maxZoom) {
    map.flyTo(bounds.getCenter(), maxZoom, { duration: 0.5 });
  } else {
    map.flyToBounds(bounds, { padding: [60, 60], maxZoom, duration: 0.5 });
  }
}
