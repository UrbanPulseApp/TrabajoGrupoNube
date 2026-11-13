import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { getOpenDataIncidents } from "../services/IncidentService.js";
import "leaflet/dist/leaflet.css";
import "./OpenDataIncidentsMap.css";

const malagaCenter = [36.7213, -4.4214];
const yearColors = { 2022: "#66885f", 2023: "#4e8d86", 2024: "#df9a52", 2025: "#8b75a9", 2026: "#c65d50" };

function createPopup(incident) {
  const container = document.createElement("div");
  container.className = "opendata-popup";
  const title = document.createElement("strong");
  title.textContent = incident.title || "Incidencia resuelta";
  container.appendChild(title);

  if (incident.category) {
    const category = document.createElement("span");
    category.textContent = incident.category;
    container.appendChild(category);
  }
  if (incident.description && incident.description !== incident.title) {
    const description = document.createElement("p");
    description.textContent = incident.description;
    container.appendChild(description);
  }
  const meta = document.createElement("small");
  meta.textContent = [incident.resolvedDate, incident.department].filter(Boolean).join(" · ") || `Expediente ${incident.year}`;
  container.appendChild(meta);
  return container;
}

function IncidentLayer({ incidents }) {
  const map = useMap();

  useEffect(() => {
    const layer = L.layerGroup().addTo(map);
    let renderFrame = null;
    const render = () => {
      renderFrame = null;
      layer.clearLayers();
      const zoom = map.getZoom();
      const cellSize = zoom >= 17 ? 34 : 52;
      const buckets = new Map();
      const visibleBounds = map.getBounds().pad(0.08);
      incidents.forEach((incident) => {
        const latLng = L.latLng(incident.latitude, incident.longitude);
        if (!visibleBounds.contains(latLng)) return;
        const pixel = map.project(latLng, zoom);
        const key = `${Math.floor(pixel.x / cellSize)}:${Math.floor(pixel.y / cellSize)}`;
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(incident);
      });

      buckets.forEach((bucket) => {
        const center = bucket.reduce((total, incident) => [total[0] + incident.latitude / bucket.length, total[1] + incident.longitude / bucket.length], [0, 0]);
        if (bucket.length > 1) {
          const icon = L.divIcon({ className: "opendata-cluster-icon", html: `<span>${bucket.length.toLocaleString("es-ES")}</span>`, iconSize: [40, 40], iconAnchor: [20, 20] });
          L.marker(center, { icon }).addTo(layer).bindTooltip(`${bucket.length.toLocaleString("es-ES")} incidencias`).on("click", () => map.setView(center, Math.min(map.getZoom() + 2, 18)));
          return;
        }

        const incident = bucket[0];
        L.circleMarker(center, { radius: 5, color: "#fff", weight: 1, fillColor: yearColors[incident.year] || "#557e66", fillOpacity: 0.82 })
          .bindPopup(createPopup(incident))
          .addTo(layer);
      });
    };
    const scheduleRender = () => {
      if (renderFrame !== null) return;
      renderFrame = window.requestAnimationFrame(render);
    };

    render();
    map.on("moveend", scheduleRender);
    return () => {
      map.off("moveend", scheduleRender);
      if (renderFrame !== null) window.cancelAnimationFrame(renderFrame);
      layer.clearLayers();
      map.removeLayer(layer);
    };
  }, [incidents, map]);

  return null;
}

function FitIncidentData({ incidents }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current || incidents.length === 0) return;
    const bounds = L.latLngBounds(incidents.map((incident) => [incident.latitude, incident.longitude]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 12, animate: false });
      fitted.current = true;
    }
  }, [incidents, map]);

  return null;
}

export default function OpenDataIncidentsMap() {
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getOpenDataIncidents(controller.signal)
      .then(setDataset)
      .catch((loadError) => { if (loadError.name !== "AbortError") setError(loadError.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const categories = useMemo(() => Array.from(new Set((dataset?.incidents || []).map((item) => item.category).filter(Boolean))).sort(), [dataset]);
  const visibleIncidents = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("es");
    return (dataset?.incidents || []).filter((incident) => {
      if (year && String(incident.year) !== year) return false;
      if (category && incident.category !== category) return false;
      if (!search) return true;
      return [incident.title, incident.description, incident.category, incident.department]
        .filter(Boolean).some((value) => value.toLocaleLowerCase("es").includes(search));
    });
  }, [dataset, year, category, query]);

  return (
    <section className="opendata-map-section" id="mapa-incidencias">
      <div className="opendata-map-heading">
        <div><span className="section-kicker">HISTÓRICO MUNICIPAL · GECOR</span><h2>Incidencias resueltas en Málaga</h2><p>Expedientes publicados por el Ayuntamiento, ubicados en el mapa.</p></div>
        <span className="opendata-map-count">{loading ? "Cargando datos…" : `${visibleIncidents.length.toLocaleString("es-ES")} incidencias`}</span>
      </div>

      <div className="opendata-map-toolbar">
        <input aria-label="Buscar en incidencias de Open Data" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar descripción o departamento…" />
        <select aria-label="Filtrar por año" value={year} onChange={(event) => setYear(event.target.value)}><option value="">Todos los años</option>{(dataset?.yearsIncluded || []).slice().sort((a, b) => b - a).map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select aria-label="Filtrar por categoría" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Todas las categorías</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      </div>

      {error && <div className="opendata-map-message" role="alert"><strong>No se pudo consultar Open Data Málaga.</strong><span>{error}</span><small>Comprueba la conexión a Internet del backend y vuelve a cargar la página.</small></div>}
      {dataset?.unavailableYears?.length > 0 && <p className="opendata-map-warning">No se pudieron cargar los conjuntos de {dataset.unavailableYears.join(", ")}; se muestran los años disponibles.</p>}
      {!error && <MapContainer center={malagaCenter} zoom={12} scrollWheelZoom preferCanvas className="opendata-leaflet-map">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitIncidentData incidents={visibleIncidents} />
        <IncidentLayer incidents={visibleIncidents} />
      </MapContainer>}
      <div className="opendata-map-footer">
        <span><i className="opendata-source-dot" /> Los marcadores representan incidencias ya resueltas.</span>
        {dataset?.truncated && <span>Se muestran las 25.000 más recientes de {dataset.totalAvailable.toLocaleString("es-ES")} expedientes.</span>}
        {dataset?.loadedAt && <span>Datos consultados: {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date(dataset.loadedAt))}</span>}
        <a href="https://datosabiertos.malaga.eu/dataset/incidencias-resueltas-en-la-via-publica-para-el-ano-2026" target="_blank" rel="noreferrer">Fuente: Open Data Málaga · GECOR · CC BY 4.0 ↗</a>
      </div>
    </section>
  );
}
