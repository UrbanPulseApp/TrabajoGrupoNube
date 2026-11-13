import { STATUS_LABEL } from "../../lib/incidentMeta.js";
import { StatusIcon } from "./icons.jsx";

export default function StatusPill({ status }) {
  return (
    <span className={`status-pill status-${String(status).toLowerCase()}`}>
      <StatusIcon status={status} />
      {STATUS_LABEL[status] || status}
    </span>
  );
}
