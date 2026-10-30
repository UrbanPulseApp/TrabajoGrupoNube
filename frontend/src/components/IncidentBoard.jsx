import { useEffect, useState } from "react";
import { getIncidentAttachmentUrl, getIncidentAttachments, getIncidentStatusChanges, getIncidents } from "../services/IncidentService.js";
import "./IncidentBoard.css";

const statuses = [
  ["REPORTED", "Recibida"], ["VALIDATED", "Validada"], ["REJECTED", "Rechazada"],
  ["ASSIGNED", "Asignada"], ["IN_PROGRESS", "En curso"], ["RESOLVED", "Resuelta"],
  ["REOPENED", "Reabierta"], ["CLOSED", "Cerrada"],
];
const statusLabels = Object.fromEntries(statuses);
const categories = [["STREET", "Vía pública"], ["LIGHTING", "Alumbrado"], ["CLEANING", "Limpieza"], ["GREEN_AREAS", "Zonas verdes"], ["TRAFFIC_LIGHT", "Semáforos"], ["OTHER", "Otro"]];

function formatDate(value) {
  if (!value) return "Fecha pendiente";
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" })
    .format(new Date(value));
}

export default function IncidentBoard() {
  const [filters, setFilters] = useState({ q: "", status: "", category: "" });
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [result, setResult] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyId, setHistoryId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [attachmentError, setAttachmentError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setFilters((current) => ({ ...current, q: query.trim() })), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getIncidents({ ...filters, page, size: 6, sort: "-createdAt" }, controller.signal)
      .then(setResult)
      .catch((loadError) => {
        if (loadError.name !== "AbortError") setError(loadError.message);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filters, page]);

  function updateFilter(event) {
    setPage(0);
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function toggleHistory(id) {
    if (historyId === id) { setHistoryId(null); return; }
    setHistoryId(id);
    setHistory([]);
    setHistoryError("");
    setAttachments([]);
    setAttachmentError("");
    const [historyResult, attachmentResult] = await Promise.allSettled([
      getIncidentStatusChanges(id), getIncidentAttachments(id),
    ]);
    if (historyResult.status === "fulfilled") setHistory(historyResult.value);
    else setHistoryError(historyResult.reason.message);
    if (attachmentResult.status === "fulfilled") setAttachments(attachmentResult.value);
    else setAttachmentError(attachmentResult.reason.message);
  }

  return (
    <section className="incident-board" id="incidencias">
      <div className="board-heading">
        <div><span className="section-kicker">SEGUIMIENTO CIUDADANO</span><h2>Incidencias de la ciudad</h2></div>
        <span className="board-count">{loading ? "Actualizando…" : `${result.totalElements || 0} avisos`}</span>
      </div>
      <div className="board-filters">
        <label className="search-filter"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => { setPage(0); setQuery(event.target.value); }} placeholder="Buscar incidencias…" aria-label="Buscar incidencias" /></label>
        <select name="status" value={filters.status} onChange={updateFilter} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select name="category" value={filters.category} onChange={updateFilter} aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      {error && <div className="board-message board-error" role="alert"><strong>No se pudo cargar el listado.</strong><span>{error}</span><small>Comprueba que el backend esté iniciado en el puerto 8080.</small></div>}
      {!error && loading && <div className="board-message">Cargando incidencias…</div>}
      {!error && !loading && result.content?.length === 0 && (
        <div className="board-message board-empty"><span aria-hidden="true">⌖</span><strong>Aún no hay incidencias con estos filtros.</strong><small>Cuando se registre un aviso, aparecerá aquí para facilitar su seguimiento.</small></div>
      )}
      {!error && !loading && result.content?.length > 0 && (
        <div className="incident-list">
          {result.content.map((incident) => (
            <article className="incident-row" key={incident.id}>
              <div className="incident-row-main">
                <span className={`status-pill status-${incident.status?.toLowerCase()}`}>{statusLabels[incident.status] || incident.status}</span>
                <div className="incident-row-title"><h3>{incident.title}</h3><span>{formatDate(incident.createdAt)}</span></div>
                <p>{incident.description}</p>
                <div className="incident-row-meta"><span>{categories.find(([value]) => value === incident.category)?.[1] || incident.category || "Sin categoría"}</span><span>⌖ {incident.location?.latitude?.toFixed(4)}, {incident.location?.longitude?.toFixed(4)}</span></div>
              </div>
              <button className="history-button" type="button" onClick={() => toggleHistory(incident.id)}>{historyId === incident.id ? "Ocultar detalles" : "Historial y evidencias"}<span aria-hidden="true">{historyId === incident.id ? "⌃" : "⌄"}</span></button>
              {historyId === incident.id && (
                <div className="incident-history">
                  <strong>Historial de estado</strong>
                  {historyError ? <p role="alert">{historyError}</p> : history.length === 0 ? <p>No hay cambios de estado registrados todavía.</p> : history.map((change) => (
                    <div className="history-event" key={change.id}><span className="history-mark" /><div><b>{statusLabels[change.newStatus] || change.newStatus}</b><span>{change.previousStatus ? `${statusLabels[change.previousStatus] || change.previousStatus} → ` : ""}{formatDate(change.changedAt)}</span>{change.reason && <small>{change.reason}</small>}</div></div>
                  ))}
                  <strong className="attachment-heading">Evidencias</strong>
                  {attachmentError ? <p role="alert">{attachmentError}</p> : attachments.length === 0 ? <p>Esta incidencia no tiene archivos adjuntos.</p> : <ul className="attachment-links">{attachments.map((attachment) => <li key={attachment.id}><a href={getIncidentAttachmentUrl(incident.id, attachment.id)} target="_blank" rel="noreferrer">↗ {attachment.filename}</a><span>{Math.max(1, Math.round(attachment.size / 1024))} KB</span></li>)}</ul>}
                </div>
              )}
            </article>
          ))}
          <div className="board-pagination"><span>Página {page + 1} de {Math.max(result.totalPages || 0, 1)}</span><div><button type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Anterior</button><button type="button" disabled={page + 1 >= result.totalPages} onClick={() => setPage((current) => current + 1)}>Siguiente</button></div></div>
        </div>
      )}
    </section>
  );
}
