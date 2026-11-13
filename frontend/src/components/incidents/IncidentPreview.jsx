import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { relativeTime } from "../../lib/incidentMeta.js";
import StatusPill from "../ui/StatusPill.jsx";
import CategoryBadge from "../ui/CategoryBadge.jsx";
import "./incidents.css";

/** Ficha flotante sobre el mapa al pulsar un marcador. Todo el título lleva a la incidencia. */
export default function IncidentPreview({ incident, onClose }) {
  return (
    <aside className="map-preview" aria-label="Incidencia seleccionada">
      <button type="button" className="map-preview-close btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Cerrar ficha"><X size={17} aria-hidden="true" /></button>
      <div className="map-preview-top">
        <StatusPill status={incident.status} />
        <span className="meta-item">{relativeTime(incident.createdAt)}</span>
      </div>
      <h3 className="map-preview-title">
        <Link to={`/incidencias/${incident.id}`} className="map-preview-link">{incident.title}</Link>
      </h3>
      <p className="map-preview-desc clamp-3">{incident.description}</p>
      <div className="map-preview-foot">
        <CategoryBadge category={incident.category} />
        <Link className="btn btn-primary btn-sm" to={`/incidencias/${incident.id}`}>Ver incidencia <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
    </aside>
  );
}
