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
    result.push({ items: bucket, center: [total[0] / bucket.length, total[1] / bucket.length] });
  });
  return result;
}

export function zoomToBucket(map, bucket, getLatLng) {
  const bounds = L.latLngBounds(bucket.items.map(getLatLng));
  if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
    map.flyTo(bounds.getCenter(), Math.min(map.getZoom() + 3, 19));
  } else {
    map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 18, duration: 0.5 });
  }
}
