import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import L from "leaflet";
import { useMapEvents } from "react-leaflet";
import {
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Layers, List, LocateFixed, Map as MapIcon, Plus, RefreshCw, Search, SearchX, SlidersHorizontal, TriangleAlert, X,
} from "lucide-react";
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
  const [listOpen, setListOpen] = useState(true);
  const [edges, setEdges] = useState({ start: true, end: true });
  const fitted = useRef(false);
  const listRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const filtersRef = useRef(null);

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
  const openCount = useMemo(() => filtered.filter((incident) => OPEN_STATUSES.includes(incident.status)).length, [filtered]);
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
    map.panInside([incident.latitude, incident.longitude], { paddingTopLeft: [50, 60], paddingBottomRight: [50, narrow ? 320 : 250] });
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
      listRef.current?.querySelector(`[data-incident-id="${selectedId}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    });
  }, [selectedId, filtered, visibleCount]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [query, scope, category]);
  useEffect(() => { map?.invalidateSize(); }, [map, view, listOpen]);

  // Estado de los extremos de la tira horizontal (habilita/deshabilita las flechas)
  const syncEdges = useCallback(() => {
    const track = listRef.current;
    if (!track) return;
    const start = track.scrollLeft <= 1;
    const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    setEdges((current) => (current.start === start && current.end === end ? current : { start, end }));
  }, []);

  useEffect(() => {
    const track = listRef.current;
    if (!track) return undefined;
    let frame = 0;
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(syncEdges); };
    const observer = new ResizeObserver(onScroll);
    observer.observe(track);
    track.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); track.removeEventListener("scroll", onScroll); };
  }, [syncEdges, listOpen, loading]);

  useEffect(() => { syncEdges(); }, [syncEdges, filtered, visibleCount]);

  // Si una flecha se deshabilita con el foco dentro, el foco pasa a la contraria
  useEffect(() => {
    if (edges.start && document.activeElement === prevRef.current) nextRef.current?.focus();
    if (edges.end && document.activeElement === nextRef.current) prevRef.current?.focus();
  }, [edges]);

  // Desplaza la tira hasta la siguiente/anterior tarjeta (no un ancho fijo de pantalla)
  function scrollStrip(direction) {
    const track = listRef.current;
    if (!track) return;
    const cards = [...track.querySelectorAll(".inc-card")];
    const origin = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).scrollPaddingLeft || 0);
    const offsets = cards.map((card) => card.getBoundingClientRect().left - origin);
    const target = direction > 0
      ? offsets.find((offset) => offset > 4)
      : [...offsets].reverse().find((offset) => offset < -4);
    if (target === undefined) return;
    const smooth = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    track.scrollBy({ left: target, behavior: smooth ? "smooth" : "auto" });
  }

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

  // Sin anchor positioning (p. ej. Firefox) el popover se coloca bajo su botón con coordenadas fijas
  useEffect(() => {
    const panel = filtersRef.current;
    if (!panel || CSS.supports("position-area: block-end")) return undefined;
    const place = (event) => {
      if (event.newState !== "open") return;
      const trigger = document.querySelector('[popovertarget="explore-filters"]');
      const rect = trigger.getBoundingClientRect();
      panel.style.top = `${rect.bottom + 6}px`;
      panel.style.right = `${Math.max(window.innerWidth - rect.right, 8)}px`;
    };
    panel.addEventListener("toggle", place);
    return () => panel.removeEventListener("toggle", place);
  }, []);

  const clearFilters = () => { setQuery(""); setScope("all"); setCategory(""); };
  const hasFilters = query || scope !== "all" || category;
  const activeFilterCount = (scope !== "all" ? 1 : 0) + (category ? 1 : 0);
  const shown = filtered.slice(0, visibleCount);

  return (
    <div className="explore" data-view={view} data-list={listOpen ? "open" : "closed"}>
      <section className="explore-panel" aria-label="Filtros y listado de incidencias">
        <div className="explore-head">
          <div className="explore-title">
            <h1>Incidencias</h1>
            <p className="explore-count mono" aria-live="polite">
              {loading ? "cargando…" : `${filtered.length} ${filtered.length === 1 ? "aviso" : "avisos"} · ${openCount} ${openCount === 1 ? "abierto" : "abiertos"}`}
            </p>
            <button type="button" className="btn btn-ghost btn-icon btn-sm explore-refresh" onClick={() => load()} disabled={loading} aria-label="Actualizar incidencias" title="Actualizar">
              <RefreshCw size={15} className={loading ? "spin" : ""} aria-hidden="true" />
            </button>
          </div>

          <div className="explore-tools">
            <div className="input-icon explore-search">
              <Search size={17} aria-hidden="true" />
              <input className="input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por título o descripción" aria-label="Buscar incidencias" />
              {query && <button type="button" className="btn btn-ghost btn-icon btn-sm input-clear" onClick={() => setQuery("")} aria-label="Borrar búsqueda"><X size={16} aria-hidden="true" /></button>}
            </div>
            <button type="button" className={`btn btn-outline explore-filter-btn ${activeFilterCount ? "is-active" : ""}`} popoverTarget="explore-filters">
              <SlidersHorizontal size={16} aria-hidden="true" /> Filtros
              {activeFilterCount > 0 && <span className="filter-badge" aria-label={`${activeFilterCount} activos`}>{activeFilterCount}</span>}
            </button>
          </div>

          <div id="explore-filters" ref={filtersRef} popover="auto" className="filters-popover" aria-label="Filtros">
            <fieldset className="filters-group">
              <legend>Estado</legend>
              <div className="segmented" role="group" aria-label="Estado de las incidencias">
                {SCOPES.map(([value, label]) => <button key={value} type="button" aria-pressed={scope === value} onClick={() => setScope(value)}>{label}</button>)}
              </div>
            </fieldset>
            <fieldset className="filters-group">
              <legend>Categoría</legend>
              <div className="filters-categories" role="group" aria-label="Filtrar por categoría">
                <button type="button" className="chip" aria-pressed={category === ""} onClick={() => setCategory("")}>Todas <span className="chip-count">{scoped.length}</span></button>
                {CATEGORIES.map(([value, label]) => (
                  <button key={value} type="button" className="chip" aria-pressed={category === value} onClick={() => setCategory(category === value ? "" : value)}>
                    <CategoryIcon category={value} />{label}<span className="chip-count">{categoryCounts[value] || 0}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="filters-foot">
              <span className="mono">{filtered.length} resultados</span>
              <button type="button" className="link-button" onClick={clearFilters} disabled={!hasFilters}>Quitar filtros</button>
            </div>
          </div>
        </div>

        <div className="explore-list" id="explore-list" hidden={!listOpen}>
          {!loading && !error && shown.length > 0 && (
            <>
              <button ref={prevRef} type="button" className="strip-arrow is-prev" onClick={() => scrollStrip(-1)} disabled={edges.start} aria-label="Incidencias anteriores"><ChevronLeft size={18} aria-hidden="true" /></button>
              <button ref={nextRef} type="button" className="strip-arrow is-next" onClick={() => scrollStrip(1)} disabled={edges.end} aria-label="Más incidencias"><ChevronRight size={18} aria-hidden="true" /></button>
            </>
          )}
          <div className="explore-track" ref={listRef} data-start={edges.start} data-end={edges.end}>
            {loading && <ul>{[0, 1, 2, 3, 4].map((key) => <IncidentCardSkeleton key={key} />)}</ul>}
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
        </div>

        <button type="button" className="explore-handle" onClick={() => setListOpen((open) => !open)} aria-expanded={listOpen} aria-controls="explore-list">
          {listOpen ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
          {listOpen ? "Ocultar avisos" : `Mostrar ${filtered.length} avisos`}
        </button>
      </section>

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
