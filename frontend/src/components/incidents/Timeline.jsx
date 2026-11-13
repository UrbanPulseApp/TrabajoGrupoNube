import { STATUS_LABEL, formatDateTime } from "../../lib/incidentMeta.js";

export default function Timeline({ createdAt, changes }) {
  const events = [
    ...changes.map((change) => ({
      key: change.id,
      title: STATUS_LABEL[change.newStatus] || change.newStatus,
      from: change.previousStatus ? STATUS_LABEL[change.previousStatus] || change.previousStatus : "",
      reason: change.reason,
      at: change.changedAt,
      status: change.newStatus,
    })),
  ].reverse();

  return (
    <ol className="timeline">
      {events.map((event) => (
        <li key={event.key} className={`timeline-item status-${String(event.status).toLowerCase()}`}>
          <span className="timeline-dot" />
          <div>
            <strong>{event.title}</strong>
            <time dateTime={event.at} className="timeline-time">{formatDateTime(event.at)}</time>
            {event.from && <small className="timeline-from">Antes: {event.from}</small>}
            {event.reason && <p className="timeline-reason">{event.reason}</p>}
          </div>
        </li>
      ))}
      <li className="timeline-item status-reported">
        <span className="timeline-dot" />
        <div>
          <strong>Aviso registrado</strong>
          <time dateTime={createdAt} className="timeline-time">{formatDateTime(createdAt)}</time>
        </div>
      </li>
    </ol>
  );
}
