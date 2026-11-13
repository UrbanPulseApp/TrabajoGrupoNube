import { Link } from "react-router-dom";
import { ChevronRight, MapPin } from "lucide-react";
import { relativeTime, formatDateTime } from "../../lib/incidentMeta.js";
import StatusPill from "../ui/StatusPill.jsx";
import CategoryBadge from "../ui/CategoryBadge.jsx";
import { CategoryIcon } from "../ui/icons.jsx";
import "./incidents.css";

/** Tarjeta de incidencia: entera es un enlace a su ficha; el botón del mapa la localiza. */
export default function IncidentCard({ incident, selected = false, onLocate, onHover }) {
  return (
    <li
      className={`inc-card status-${incident.status.toLowerCase()} ${selected ? "is-selected" : ""}`}
      data-incident-id={incident.id}
      onMouseEnter={() => onHover?.(incident.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <Link className="inc-card-link" to={`/incidencias/${incident.id}`} aria-label={`${incident.title}. Abrir incidencia`}>
        <span className="inc-card-icon" aria-hidden="true"><CategoryIcon category={incident.category} size={20} /></span>
        <span className="inc-card-body">
          <span className="inc-card-top">
            <StatusPill status={incident.status} />
            <time dateTime={incident.createdAt} title={formatDateTime(incident.createdAt)} className="inc-card-time">{relativeTime(incident.createdAt)}</time>
          </span>
          <h3 className="inc-card-title clamp-2">{incident.title}</h3>
          <span className="inc-card-desc clamp-2">{incident.description}</span>
          <span className="inc-card-foot"><CategoryBadge category={incident.category} /></span>
        </span>
        <ChevronRight className="inc-card-chevron" size={18} aria-hidden="true" />
      </Link>
      {onLocate && (
        <button type="button" className="inc-card-locate" onClick={() => onLocate(incident)} aria-label={`Ver en el mapa: ${incident.title}`} title="Ver en el mapa">
          <MapPin size={16} aria-hidden="true" />
        </button>
      )}
    </li>
  );
}

export function IncidentCardSkeleton() {
  return (
    <li className="inc-card inc-card-skeleton" aria-hidden="true">
      <div className="inc-card-link">
        <span className="skeleton" style={{ width: 40, height: 40, borderRadius: 12 }} />
        <span className="inc-card-body" style={{ gap: 8 }}>
          <span className="skeleton" style={{ width: 90, height: 20 }} />
          <span className="skeleton" style={{ width: "80%", height: 18 }} />
          <span className="skeleton" style={{ width: "95%", height: 14 }} />
        </span>
      </div>
    </li>
  );
}
