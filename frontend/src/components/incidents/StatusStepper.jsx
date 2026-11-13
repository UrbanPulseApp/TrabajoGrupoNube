import { Ban, Check, RotateCcw } from "lucide-react";
import { LIFECYCLE, STATUS_HELP, STATUS_LABEL } from "../../lib/incidentMeta.js";

/** Progreso de la incidencia por su ciclo de vida. REOPENED y REJECTED se muestran como avisos. */
export default function StatusStepper({ status, lastReason }) {
  const rejected = status === "REJECTED";
  const reopened = status === "REOPENED";
  const currentIndex = rejected ? -1 : reopened ? 1 : LIFECYCLE.indexOf(status);

  return (
    <div className="stepper-wrap">
      <ol className={`stepper ${rejected ? "is-rejected" : ""}`} aria-label="Progreso de la incidencia">
        {LIFECYCLE.map((step, index) => {
          const state = rejected ? "todo" : index < currentIndex || (status === "CLOSED" && index <= currentIndex) ? "done" : index === currentIndex ? "current" : "todo";
          return (
            <li key={step} className={`step is-${state}`} aria-current={state === "current" ? "step" : undefined}>
              <span className="step-dot">{state === "done" ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : null}</span>
              <span className="step-label">{STATUS_LABEL[step]}</span>
            </li>
          );
        })}
      </ol>
      {(rejected || reopened) && (
        <div className={`alert ${rejected ? "" : "is-warn"}`} role="status">
          {rejected ? <Ban aria-hidden="true" /> : <RotateCcw aria-hidden="true" />}
          <div>
            <strong>{STATUS_LABEL[status]}</strong>
            <p>{lastReason || STATUS_HELP[status]}</p>
          </div>
        </div>
      )}
      {!rejected && !reopened && <p className="stepper-help">{STATUS_HELP[status]}</p>}
    </div>
  );
}
