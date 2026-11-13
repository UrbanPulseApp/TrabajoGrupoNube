import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import L from "leaflet";
import { useMapEvents } from "react-leaflet";
import { Layers, List, LocateFixed, Map as MapIcon, Plus, RefreshCw, Search, SearchX, TriangleAlert, X } from "lucide-react";
import { getMapIncidents } from "../services/IncidentService.js";
import {
  CATEGORIES, DONE_STATUSES, MALAGA_CENTER, OPEN_STATUSES, STATUSES, STATUS_LABEL,
} from "../lib/incidentMeta.js";
import useDocumentTitle from "../lib/useDocumentTitle.js";
import { useToast } from "../context/ToastContext.jsx";
import MapSurface from "../components/map/MapSurface.jsx";
import IncidentMarkersLayer from "../components/map/IncidentMarkersLayer.jsx";
import IncidentCard, { IncidentCardSkeleton } from "../components/incidents/IncidentCard.jsx";
import IncidentPreview from "../components/incidents/IncidentPreview.jsx";
import StateBox from "../components/ui/StateBox.jsx";
import { CategoryIcon } from "../components/ui/icons.jsx";
import "./ExplorePage.css";

const PAGE_SIZE = 40;
const SCOPES = [["all", "Todas"], ["open", "Activas"], ["done", "Resueltas"]];

function DeselectOnMapClick({ onDeselect }) {
  useMapEvents({ click: onDeselect });
  return null;
}

function Legend() {
  return (
    <details className="map-overlay map-legend">
      <summary><Layers size={15} aria-hidden="true" /> Leyenda</summary>
      <ul>
        {STATUSES.map(([value, label]) => (
          <li key={value} className={`status-${value.toLowerCase()}`}><span className="legend-dot" />{label}</li>
        ))}
      </ul>
    </details>
  );
}

export default function ExplorePage() {
  useDocumentTitle("Mapa de incidencias");
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [category, setCategory] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [hoveredId, setHoveredId] = useState(null);
  const [view, setView] = useState("map");
  const [map, setMap] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [locating, setLocating] = useState(false);
  const fitted = useRef(false);
  const listRef = useRef(null);

  const selectedId = params.get("i");

  const load = useCallback((signal) => {
    setLoading(true);
    setError("");
    return getMapIncidents(signal)
      .then(setIncidents)
      .catch((loadError) => { if (loadError.name !== "AbortError") setError(loadError.message); })
      .finally(() => { if (!signal?.aborted) setLoading(false); });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const scoped = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("es");
    return incidents.filter((incident) => {
      if (scope === "open" && !OPEN_STATUSES.includes(incident.status)) return false;
      if (scope === "done" && !DONE_STATUSES.includes(incident.status)) return false;
      if (!search) return true;
      return `${incident.title} ${incident.description}`.toLocaleLowerCase("es").includes(search);
    });
  }, [incidents, query, scope]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    scoped.forEach((incident) => { counts[incident.category] = (counts[incident.category] || 0) + 1; });
    return counts;
  }, [scoped]);

  const filtered = useMemo(() => (category ? scoped.filter((incident) => incident.category === category) : scoped), [scoped, category]);
  const selected = useMemo(() => incidents.find((incident) => incident.id === selectedId) || null, [incidents, selectedId]);
  const activeId = hoveredId || selectedId;

  const select = useCallback((id) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (id) next.set("i", id); else next.delete("i");
      return next;
    }, { replace: true });
  }, [setParams]);

  // Mantiene el marcador a la vista, por encima de la ficha flotante
  const keepVisible = useCallback((incident) => {
    if (!map) return;
    const narrow = window.matchMedia("(max-width: 899px)").matches;
    map.panInside([incident.latitude, incident.longitude], { paddingTopLeft: [50, 100], paddingBottomRight: [50, narrow ? 320 : 250] });
  }, [map]);

  const flyToIncident = useCallback((incident) => {
    if (!map) return;
    map.once("moveend", () => keepVisible(incident));
    map.flyTo([incident.latitude, incident.longitude], Math.max(map.getZoom(), 16), { duration: 0.6 });
  }, [map, keepVisible]);

  // Ajuste inicial: al enlace profundo (?i=…) o a todas las incidencias
  useEffect(() => {
    if (!map || loading || fitted.current) return;
    fitted.current = true;
    const target = incidents.find((incident) => incident.id === selectedId);
    if (target) {
      map.setView([target.latitude, target.longitude], 16, { animate: false });
      keepVisible(target);
    } else if (incidents.length > 0) {
      const bounds = L.latLngBounds(incidents.map((incident) => [incident.latitude, incident.longitude]));
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15, animate: false });
    }
  }, [map, loading, incidents, selectedId, keepVisible]);

  useEffect(() => { if (selected && fitted.current) keepVisible(selected); }, [selected, keepVisible]);

  // Al seleccionar en el mapa, la tarjeta correspondiente entra en pantalla
  useEffect(() => {
    if (!selectedId) return;
    const index = filtered.findIndex((incident) => incident.id === selectedId);
    if (index >= visibleCount) setVisibleCount(index + 1);
    window.requestAnimationFrame(() => {
      listRef.current?.querySelector(`[data-incident-id="${selectedId}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }, [selectedId, filtered, visibleCount]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [query, scope, category]);
  useEffect(() => { map?.invalidateSize(); }, [map, view]);

  function locateOnMap(incident) {
    select(incident.id);
    setView("map");
    window.setTimeout(() => flyToIncident(incident), 60);
  }

  function locateMe() {
    if (!navigator.geolocation) { toast("Tu navegador no permite obtener la ubicación.", "error"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = [coords.latitude, coords.longitude];
        setUserPosition(position);
        map?.flyTo(position, 16, { duration: 0.7 });
        setLocating(false);
      },
      () => { setLocating(false); toast("No se pudo acceder a tu ubicación.", "error"); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  // Marcador de la posición del usuario
  useEffect(() => {
    if (!map || !userPosition) return undefined;
    const marker = L.marker(userPosition, {
      icon: L.divIcon({ className: "", html: '<div class="user-dot"></div>', iconSize: [16, 16], iconAnchor: [8, 8] }),
      interactive: false,
    }).addTo(map);
    return () => { marker.remove(); };
  }, [map, userPosition]);

  const clearFilters = () => { setQuery(""); setScope("all"); setCategory(""); };
  const hasFilters = query || scope !== "all" || category;
  const shown = filtered.slice(0, visibleCount);

  return (
    <div className="explore" data-view={view}>
      <aside className="explore-panel">
        <div className="explore-head">
          <div className="explore-title">
            <h1>Incidencias en la ciudad</h1>
            <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => load()} disabled={loading} aria-label="Actualizar incidencias" title="Actualizar">
              <RefreshCw size={16} className={loading ? "spin" : ""} aria-hidden="true" />
            </button>
          </div>
          <div className="input-icon">
            <Search size={17} aria-hidden="true" />
            <input className="input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por título o descripción" aria-label="Buscar incidencias" />
            {query && <button type="button" className="btn btn-ghost btn-icon btn-sm input-clear" onClick={() => setQuery("")} aria-label="Borrar búsqueda"><X size={16} aria-hidden="true" /></button>}
          </div>
          <div className="segmented" role="group" aria-label="Estado de las incidencias">
            {SCOPES.map(([value, label]) => <button key={value} type="button" aria-pressed={scope === value} onClick={() => setScope(value)}>{label}</button>)}
          </div>
          <div className="chip-row" role="group" aria-label="Filtrar por categoría">
            <button type="button" className="chip" aria-pressed={category === ""} onClick={() => setCategory("")}>Todas <span className="chip-count">{scoped.length}</span></button>
            {CATEGORIES.map(([value, label]) => (
              <button key={value} type="button" className="chip" aria-pressed={category === value} onClick={() => setCategory(category === value ? "" : value)}>
                <CategoryIcon category={value} />{label}<span className="chip-count">{categoryCounts[value] || 0}</span>
              </button>
            ))}
          </div>
          <p className="explore-count" aria-live="polite">
            {loading ? "Cargando…" : `${filtered.length} ${filtered.length === 1 ? "aviso" : "avisos"}`}
            {!loading && hasFilters && <button type="button" className="link-button" onClick={clearFilters}>Quitar filtros</button>}
          </p>
        </div>

        <div className="explore-list" ref={listRef}>
          {loading && <ul>{[0, 1, 2, 3].map((key) => <IncidentCardSkeleton key={key} />)}</ul>}
          {!loading && error && (
            <StateBox icon={TriangleAlert} title="No se pudieron cargar las incidencias" error action={<button type="button" className="btn btn-outline btn-sm" onClick={() => load()}>Reintentar</button>}>
              {error} Comprueba que el backend esté iniciado en el puerto 8080.
            </StateBox>
          )}
          {!loading && !error && filtered.length === 0 && (
            <StateBox
              icon={hasFilters ? SearchX : MapIcon}
              title={hasFilters ? "Ninguna incidencia coincide" : "Aún no hay incidencias"}
              action={hasFilters
                ? <button type="button" className="btn btn-outline btn-sm" onClick={clearFilters}>Quitar filtros</button>
                : <Link className="btn btn-accent btn-sm" to="/reportar"><Plus size={16} aria-hidden="true" /> Reportar la primera</Link>}
            >
              {hasFilters ? "Prueba con otra búsqueda o con otra categoría." : "Cuando alguien comunique un aviso aparecerá aquí y en el mapa."}
            </StateBox>
          )}
          {!loading && !error && shown.length > 0 && (
            <ul>
              {shown.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} selected={incident.id === selectedId} onLocate={locateOnMap} onHover={setHoveredId} />
              ))}
            </ul>
          )}
          {!loading && filtered.length > shown.length && (
            <div className="explore-more"><button type="button" className="btn btn-outline btn-sm" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>Mostrar más ({filtered.length - shown.length})</button></div>
          )}
        </div>
      </aside>

      <section className={`explore-map map-stage ${selected ? "has-preview" : ""}`} aria-label="Mapa de incidencias">
        <MapSurface mapRef={setMap} center={MALAGA_CENTER} zoom={13}>
          <DeselectOnMapClick onDeselect={() => select(null)} />
          <IncidentMarkersLayer incidents={filtered} selectedId={activeId} onSelect={select} />
        </MapSurface>
        <div className="map-overlay map-tools">
          <button type="button" className="map-fab" onClick={locateMe} disabled={locating} aria-label="Ir a mi ubicación" title="Mi ubicación"><LocateFixed aria-hidden="true" /></button>
        </div>
        <Legend />
        {selected && <IncidentPreview incident={selected} onClose={() => select(null)} />}
        {!loading && !error && incidents.length === 0 && <div className="map-empty-note">Aún no hay incidencias registradas.</div>}
      </section>

      <button type="button" className="btn btn-primary explore-toggle" onClick={() => setView((current) => (current === "map" ? "list" : "map"))}>
        {view === "map" ? <><List size={17} aria-hidden="true" /> Ver lista</> : <><MapIcon size={17} aria-hidden="true" /> Ver mapa</>}
      </button>
    </div>
  );
}
