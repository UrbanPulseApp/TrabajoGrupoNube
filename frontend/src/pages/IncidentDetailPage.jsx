import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Camera, Clock, Copy, FileSearch, History, Info, Map as MapIcon, MapPinned, Navigation, Share2, TriangleAlert } from "lucide-react";
import {
  findDuplicateIncidents, getIncident, getIncidentAttachments, getIncidentContext, getIncidentStatusChanges,
} from "../services/IncidentService.js";
import { formatDateTime, relativeTime, shortRef } from "../lib/incidentMeta.js";
import useDocumentTitle from "../lib/useDocumentTitle.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import StatusPill from "../components/ui/StatusPill.jsx";
import CategoryBadge from "../components/ui/CategoryBadge.jsx";
import StateBox from "../components/ui/StateBox.jsx";
import StatusStepper from "../components/incidents/StatusStepper.jsx";
import Timeline from "../components/incidents/Timeline.jsx";
import Gallery from "../components/incidents/Gallery.jsx";
import UrbanContextPanel from "../components/incidents/UrbanContextPanel.jsx";
import MiniMap from "../components/incidents/MiniMap.jsx";
import IncidentOperations from "../components/incidents/IncidentOperations.jsx";
import "../components/incidents/incidents.css";
import "./IncidentDetailPage.css";

function DetailSkeleton() {
  return (
    <div className="page detail" aria-busy="true" aria-label="Cargando incidencia">
      <span className="skeleton" style={{ display: "block", width: 120, height: 18, marginBottom: 20 }} />
      <span className="skeleton" style={{ display: "block", width: "60%", height: 40, marginBottom: 14 }} />
      <span className="skeleton" style={{ display: "block", width: "40%", height: 18, marginBottom: 28 }} />
      <div className="detail-grid">
        <span className="skeleton" style={{ display: "block", height: 320, borderRadius: 16 }} />
        <span className="skeleton" style={{ display: "block", height: 320, borderRadius: 16 }} />
      </div>
    </div>
  );
}

export default function IncidentDetailPage() {
  const { id } = useParams();
  const { user, isStaff } = useAuth();
  const toast = useToast();
  const [incident, setIncident] = useState(null);
  const [error, setError] = useState(null);
  const [changes, setChanges] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [context, setContext] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [extrasLoading, setExtrasLoading] = useState(true);

  useDocumentTitle(incident ? incident.title : "Incidencia");

  const load = useCallback(async (signal) => {
    try {
      const data = await getIncident(id, signal);
      if (signal?.aborted) return;
      setIncident(data);
      setError(null);
      const [history, files, urban, near] = await Promise.allSettled([
        getIncidentStatusChanges(id),
        getIncidentAttachments(id),
        getIncidentContext(id),
        findDuplicateIncidents(data.location.latitude, data.location.longitude, null, 300),
      ]);
      if (signal?.aborted) return;
      setChanges(history.status === "fulfilled" ? history.value : []);
      setAttachments(files.status === "fulfilled" ? files.value : []);
      setContext(urban.status === "fulfilled" ? urban.value : null);
      setNearby(near.status === "fulfilled" ? near.value.filter((item) => item.id !== id).slice(0, 5) : []);
      setExtrasLoading(false);
    } catch (loadError) {
      if (loadError.name !== "AbortError") setError(loadError);
    }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    setIncident(null);
    setError(null);
    setExtrasLoading(true);
    load(controller.signal);
    window.scrollTo(0, 0);
    return () => controller.abort();
  }, [load]);

  if (error) {
    const notFound = error.status === 404;
    return (
      <div className="page page-narrow">
        <StateBox icon={notFound ? FileSearch : TriangleAlert} title={notFound ? "No encontramos esa incidencia" : "No se pudo cargar la incidencia"} error={!notFound}
          action={<Link className="btn btn-primary" to="/"><MapIcon size={17} aria-hidden="true" /> Volver al mapa</Link>}>
          {notFound ? "Puede que el enlace esté incompleto o que la incidencia ya no exista." : error.message}
        </StateBox>
      </div>
    );
  }
  if (!incident) return <DetailSkeleton />;

  const { latitude, longitude } = incident.location;
  const url = window.location.href;
  const lastReason = [...changes].reverse().find((change) => change.newStatus === incident.status)?.reason;

  async function copy(text, message) {
    try {
      await navigator.clipboard.writeText(text);
      toast(message);
    } catch {
      toast("No se pudo copiar. Copia la dirección desde la barra del navegador.", "error");
    }
  }

  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: incident.title, text: "Incidencia en UrbanPulse", url }); } catch { /* cancelado */ }
    } else {
      copy(url, "Enlace copiado");
    }
  }

  return (
    <article className="page detail">
      <Link className="back-link" to={`/?i=${incident.id}`}><ArrowLeft size={17} aria-hidden="true" /> Volver al mapa</Link>

      <header className="detail-head">
        <div className="row">
          <StatusPill status={incident.status} />
          <CategoryBadge category={incident.category} />
        </div>
        <h1>{incident.title}</h1>
        <div className="detail-meta">
          <span className="meta-item"><Clock aria-hidden="true" /> Registrada el {formatDateTime(incident.createdAt)} ({relativeTime(incident.createdAt)})</span>
          <button type="button" className="ref-chip" onClick={() => copy(incident.id, "Referencia copiada")} title="Copiar la referencia completa">
            Ref. {shortRef(incident.id)} <Copy size={13} aria-hidden="true" />
          </button>
        </div>
      </header>

      <StatusStepper status={incident.status} lastReason={lastReason} />

      <div className="detail-grid">
        <div className="detail-main">
          <section className="panel">
            <h2 className="panel-title"><Info aria-hidden="true" /> Descripción</h2>
            <p className="detail-description">{incident.description}</p>
          </section>

          <section className="panel">
            <h2 className="panel-title"><Camera aria-hidden="true" /> Evidencias {attachments.length > 0 && <span className="count-tag">{attachments.length}</span>}</h2>
            {extrasLoading ? <span className="skeleton" style={{ display: "block", height: 160 }} />
              : attachments.length === 0 ? <p className="field-hint">Este aviso no tiene fotos ni documentos adjuntos.</p>
                : <Gallery incidentId={incident.id} attachments={attachments} />}
          </section>

          <section className="panel">
            <h2 className="panel-title"><History aria-hidden="true" /> Historial</h2>
            {extrasLoading ? <span className="skeleton" style={{ display: "block", height: 120 }} /> : <Timeline createdAt={incident.createdAt} changes={changes} />}
          </section>

          <section className="panel">
            <h2 className="panel-title"><MapPinned aria-hidden="true" /> Contexto urbano</h2>
            {extrasLoading ? <span className="skeleton" style={{ display: "block", height: 140 }} />
              : context ? <UrbanContextPanel context={context} /> : <p className="field-hint">No hay datos de contexto disponibles para esta ubicación.</p>}
          </section>
        </div>

        <aside className="detail-side">
          <section className="panel map-panel">
            <div className="mini-map-frame"><MiniMap incident={incident} /></div>
            <div className="map-panel-body">
              <p className="coords tabular">{latitude.toFixed(5)}° N, {Math.abs(longitude).toFixed(5)}° {longitude < 0 ? "O" : "E"}</p>
              {context?.address && <p className="field-hint">{context.address}</p>}
              <div className="map-panel-actions">
                <a className="btn btn-primary btn-sm" href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`} target="_blank" rel="noreferrer"><Navigation size={16} aria-hidden="true" /> Cómo llegar</a>
                <Link className="btn btn-outline btn-sm" to={`/?i=${incident.id}`}><MapIcon size={16} aria-hidden="true" /> Ver en el mapa</Link>
                <button type="button" className="btn btn-outline btn-sm" onClick={share}><Share2 size={16} aria-hidden="true" /> Compartir</button>
              </div>
            </div>
          </section>

          {isStaff && <IncidentOperations incident={incident} role={user.role} onChanged={() => load()} />}

          {nearby.length > 0 && (
            <section className="panel">
              <h2 className="panel-title"><MapPinned aria-hidden="true" /> Otros avisos cerca</h2>
              <ul className="nearby-list">
                {nearby.map((item) => (
                  <li key={item.id}>
                    <Link to={`/incidencias/${item.id}`}>
                      <span className="nearby-title">{item.title}</span>
                      <span className="nearby-meta"><StatusPill status={item.status} />{item.distanceMeters != null && <span className="meta-item tabular">a {Math.round(item.distanceMeters)} m</span>}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </article>
  );
}
