import { useEffect, useState } from "react";
import { Wrench } from "lucide-react";
import {
  createIncidentAssignment,
  getIncidentAssignments,
  patchIncidentStatus,
  updateIncidentAssignment,
} from "../../services/IncidentService.js";
import { ROLE_LABEL } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { STATUS_LABEL } from "../../lib/incidentMeta.js";

const TRANSITIONS = {
  REPORTED: ["VALIDATED", "REJECTED"],
  VALIDATED: ["ASSIGNED", "REJECTED"],
  ASSIGNED: ["IN_PROGRESS", "VALIDATED"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CLOSED", "REOPENED"],
  REOPENED: ["ASSIGNED", "IN_PROGRESS"],
};
const ASSIGNMENT_LABEL = { ACTIVE: "Activa", COMPLETED: "Completada", CANCELLED: "Cancelada" };

export default function IncidentOperations({ incident, role, onChanged }) {
  const toast = useToast();
  const canManage = role === "OPERATOR" || role === "ADMIN";
  const nextStates = TRANSITIONS[incident.status] || [];
  const [status, setStatus] = useState(nextStates[0] || "");
  const [reason, setReason] = useState("");
  const [department, setDepartment] = useState("");
  const [notes, setNotes] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setStatus(TRANSITIONS[incident.status]?.[0] || ""); }, [incident.status]);

  useEffect(() => {
    getIncidentAssignments(incident.id).then(setAssignments).catch((loadError) => setError(loadError.message));
  }, [incident.id, incident.status]);

  async function run(action, successMessage) {
    setLoading(true);
    setError("");
    try {
      await action();
      if (successMessage) toast(successMessage);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setLoading(false);
    }
  }

  const changeStatus = (event) => {
    event.preventDefault();
    run(async () => {
      await patchIncidentStatus(incident.id, status, reason || null);
      setReason("");
      onChanged?.();
    }, `Estado actualizado: ${STATUS_LABEL[status]}`);
  };

  const createAssignment = (event) => {
    event.preventDefault();
    run(async () => {
      const created = await createIncidentAssignment(incident.id, { department, notes: notes || null });
      setAssignments((current) => [...current, created]);
      setDepartment("");
      setNotes("");
      onChanged?.();
    }, "Asignación creada");
  };

  const closeAssignment = (assignmentId, nextStatus) => run(async () => {
    const updated = await updateIncidentAssignment(incident.id, assignmentId, nextStatus);
    setAssignments((current) => current.map((item) => (item.id === assignmentId ? updated : item)));
  }, nextStatus === "COMPLETED" ? "Asignación completada" : "Asignación cancelada");

  return (
    <section className="panel ops-panel" aria-label="Gestión municipal">
      <h2 className="panel-title"><Wrench aria-hidden="true" /> Gestión municipal <span className="role-tag">{ROLE_LABEL[role] || role}</span></h2>

      {canManage && nextStates.length > 0 && (
        <form className="ops-form" onSubmit={changeStatus}>
          <div className="field">
            <label htmlFor="ops-status">Cambiar estado a</label>
            <select id="ops-status" className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
              {nextStates.map((value) => <option value={value} key={value}>{STATUS_LABEL[value]}</option>)}
            </select>
          </div>
          {status === "REJECTED" && (
            <div className="field">
              <label htmlFor="ops-reason">Motivo del rechazo</label>
              <textarea id="ops-reason" className="textarea" rows={3} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} required />
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? "Guardando…" : "Guardar estado"}</button>
        </form>
      )}

      {canManage && ["VALIDATED", "REOPENED"].includes(incident.status) && (
        <form className="ops-form ops-divider" onSubmit={createAssignment}>
          <div className="field">
            <label htmlFor="ops-dept">Asignar a un departamento</label>
            <input id="ops-dept" className="input" value={department} onChange={(event) => setDepartment(event.target.value)} maxLength={120} placeholder="Ej. Alumbrado público" required />
          </div>
          <div className="field">
            <label htmlFor="ops-notes">Notas <span className="field-optional">(opcional)</span></label>
            <input id="ops-notes" className="input" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} />
          </div>
          <button type="submit" className="btn btn-outline btn-sm" disabled={loading}>Crear asignación</button>
        </form>
      )}

      <div className="ops-divider">
        <h3 className="ops-subtitle">Asignaciones</h3>
        {assignments.length === 0 ? <p className="field-hint">Todavía no hay asignaciones.</p> : (
          <ul className="assignment-list">
            {assignments.map((assignment) => (
              <li key={assignment.id}>
                <div>
                  <strong>{assignment.department}</strong>
                  <span className={`assign-state is-${String(assignment.status).toLowerCase()}`}>{ASSIGNMENT_LABEL[assignment.status] || assignment.status}</span>
                  {assignment.notes && <small>{assignment.notes}</small>}
                </div>
                {assignment.status === "ACTIVE" && (
                  <div className="row">
                    <button type="button" className="btn btn-outline btn-sm" disabled={loading} onClick={() => closeAssignment(assignment.id, "COMPLETED")}>Completar</button>
                    <button type="button" className="btn btn-ghost btn-sm" disabled={loading} onClick={() => closeAssignment(assignment.id, "CANCELLED")}>Cancelar</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <div className="alert" role="alert" style={{ marginTop: 12 }}>{error}</div>}
    </section>
  );
}
