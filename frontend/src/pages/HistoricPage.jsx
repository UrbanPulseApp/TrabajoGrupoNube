import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { useMapEvents } from "react-leaflet";
import { Building, CalendarCheck, CalendarPlus, ExternalLink, Flag, List, Map as MapIcon, MapPin, Navigation, Search, TriangleAlert, X } from "lucide-react";
import { getOpenDataIncidents } from "../services/IncidentService.js";
import { formatDate, parseGecorDescription } from "../lib/incidentMeta.js";
import useDocumentTitle from "../lib/useDocumentTitle.js";
import { useTheme } from "../context/ThemeContext.jsx";
import MapSurface from "../components/map/MapSurface.jsx";
import HistoricLayer from "../components/map/HistoricLayer.jsx";
import StateBox from "../components/ui/StateBox.jsx";
import "../components/incidents/incidents.css";
import "./ExplorePage.css";
import "./HistoricPage.css";

const SOURCE_URL = "https://datosabiertos.malaga.eu/dataset/incidencias-resueltas-en-la-via-publica-para-el-ano-2026";
// Colores del lienzo del mapa (canvas no lee variables CSS): mismos valores que --brand y --accent
const DOT = { light: "#0b6b5d", dark: "#4cc2ab" };
const SELECTED = { light: "#d98c05", dark: "#f4b942" };

function DeselectOnMapClick({ onDeselect }) {
  useMapEvents({ click: onDeselect });
  return null;
}

function Ficha({ incident, onClose }) {
  const info = parseGecorDescription(incident.description);
  const registered = info.registered ? info.registered.slice(0, 10) : "";
  return (
    <aside className="map-preview historic-ficha" aria-label="Expediente seleccionado">
      <button type="button" className="map-preview-close btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Cerrar ficha"><X size={17} aria-hidden="true" /></button>
      <span className="status-pill status-resolved">Resuelta</span>
      <h3 className="map-preview-title">{incident.category || "Incidencia municipal"}</h3>
      <dl className="ficha-list">
        {info.address && <div><dt><MapPin aria-hidden="true" /> Dirección</dt><dd>{info.address}</dd></div>}
        <div><dt><Building aria-hidden="true" /> Responsable</dt><dd>{incident.department}</dd></div>
        {registered && <div><dt><CalendarPlus aria-hidden="true" /> Registrada</dt><dd>{formatDate(registered)}</dd></div>}
        {incident.resolvedDate && <div><dt><CalendarCheck aria-hidden="true" /> Resuelta</dt><dd>{formatDate(incident.resolvedDate)}</dd></div>}
        {info.priority && <div><dt><Flag aria-hidden="true" /> Prioridad</dt><dd>{info.priority}</dd></div>}
      </dl>
      <div className="map-preview-foot">
        <span className="meta-item tabular">Expediente {incident.title}</span>
        <a className="btn btn-outline btn-sm" href={`https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`} target="_blank" rel="noreferrer"><Navigation size={15} aria-hidden="true" /> Cómo llegar</a>
      </div>
    </aside>
  );
}

export default function HistoricPage() {
  useDocumentTitle("Histórico municipal");
  const { theme } = useTheme();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState("map");
  const [map, setMap] = useState(null);
  const fitted = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    getOpenDataIncidents(controller.signal)
      .then(setDataset)
      .catch((loadError) => { if (loadError.name !== "AbortError") setError(loadError.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const all = dataset?.incidents || [];
  const years = useMemo(() => (dataset?.yearsIncluded || []).slice().sort((a, b) => b - a), [dataset]);

  const scoped = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("es");
    return all.filter((incident) => {
      if (year && String(incident.year) !== year) return false;
      if (!search) return true;
      return `${incident.title} ${incident.description} ${incident.department}`.toLocaleLowerCase("es").includes(search);
    });
  }, [all, query, year]);

  const ranking = useMemo(() => {
    const counts = new Map();
    scoped.forEach((incident) => counts.set(incident.category, (counts.get(incident.category) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [scoped]);

  const visible = useMemo(() => (category ? scoped.filter((incident) => incident.category === category) : scoped), [scoped, category]);
  const selected = useMemo(() => all.find((incident) => incident.id === selectedId) || null, [all, selectedId]);

  useEffect(() => {
    if (!map || fitted.current || all.length === 0) return;
    const bounds = L.latLngBounds(all.map((incident) => [incident.latitude, incident.longitude]));
    if (bounds.isValid()) { map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13, animate: false }); fitted.current = true; }
  }, [map, all]);

  useEffect(() => { map?.invalidateSize(); }, [map, view]);

  // El punto seleccionado queda siempre a la vista, por encima de su ficha
  useEffect(() => {
    if (!map || !selected) return;
    map.panInside([selected.latitude, selected.longitude], { paddingTopLeft: [50, 80], paddingBottomRight: [50, 400] });
  }, [map, selected]);

  const top = ranking.slice(0, 8);
  const max = top[0]?.[1] || 1;
  const hasFilters = query || category || year;

  return (
    <div className="explore historic" data-view={view}>
      <aside className="explore-panel">
        <div className="explore-head">
          <div className="explore-title"><h1>Histórico municipal</h1></div>
          <p className="historic-lead">Incidencias ya resueltas por el Ayuntamiento de Málaga (sistema GECOR), publicadas como datos abiertos.</p>
          <div className="input-icon">
            <Search size={17} aria-hidden="true" />
            <input className="input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar calle, tipo o responsable" aria-label="Buscar en el histórico" />
          </div>
          {years.length > 1 && (
            <select className="select" value={year} onChange={(event) => setYear(event.target.value)} aria-label="Año">
              <option value="">Todos los años</option>
              {years.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          )}
          <p className="explore-count" aria-live="polite">
            {loading ? "Cargando datos…" : `${visible.length.toLocaleString("es-ES")} ${visible.length === 1 ? "incidencia resuelta" : "incidencias resueltas"}`}
            {!loading && hasFilters && <button type="button" className="link-button" onClick={() => { setQuery(""); setCategory(""); setYear(""); }}>Quitar filtros</button>}
          </p>
        </div>

        <div className="explore-list historic-body">
          {error && <StateBox icon={TriangleAlert} title="No se pudo cargar el histórico" error>{error}</StateBox>}
          {loading && <div className="historic-section">{[0, 1, 2, 3, 4].map((key) => <span key={key} className="skeleton" style={{ display: "block", height: 34, marginBottom: 10 }} />)}</div>}
          {!loading && !error && (
            <>
              <section className="historic-section">
                <h2>Tipos más frecuentes</h2>
                {top.length === 0 ? <p className="field-hint">Ninguna incidencia coincide con la búsqueda.</p> : (
                  <ul className="rank-list">
                    {top.map(([name, count]) => (
                      <li key={name}>
                        <button type="button" className={`rank-row ${category === name ? "is-active" : ""}`} aria-pressed={category === name} onClick={() => setCategory(category === name ? "" : name)}>
                          <span className="rank-bar" style={{ width: `${Math.max(4, (count / max) * 100)}%` }} />
                          <span className="rank-name">{name}</span>
                          <b className="tabular">{count.toLocaleString("es-ES")}</b>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {ranking.length > top.length && (
                  <select className="select" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Todos los tipos" style={{ marginTop: 12 }}>
                    <option value="">Todos los tipos ({ranking.length})</option>
                    {ranking.map(([name, count]) => <option key={name} value={name}>{name} ({count})</option>)}
                  </select>
                )}
              </section>
              <section className="historic-section historic-source">
                <p>Pulsa un punto del mapa para ver su expediente.</p>
                <a href={SOURCE_URL} target="_blank" rel="noreferrer">Fuente: Open Data Málaga, GECOR (CC BY 4.0) <ExternalLink size={14} aria-hidden="true" /></a>
              </section>
            </>
          )}
        </div>
      </aside>

      <section className={`explore-map map-stage ${selected ? "has-preview" : ""}`} aria-label="Mapa del histórico">
        <MapSurface mapRef={setMap} zoom={12}>
          <DeselectOnMapClick onDeselect={() => setSelectedId(null)} />
          <HistoricLayer incidents={visible} selectedId={selectedId} onSelect={setSelectedId} color={DOT[theme]} selectedColor={SELECTED[theme]} />
        </MapSurface>
        {selected && <Ficha incident={selected} onClose={() => setSelectedId(null)} />}
      </section>

      <button type="button" className="btn btn-primary explore-toggle" onClick={() => setView((current) => (current === "map" ? "list" : "map"))}>
        {view === "map" ? <><List size={17} aria-hidden="true" /> Ver tipos</> : <><MapIcon size={17} aria-hidden="true" /> Ver mapa</>}
      </button>
    </div>
  );
}
