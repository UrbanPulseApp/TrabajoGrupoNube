import { useEffect, useState } from "react";
import {
  createIncidentAssignment,
  getIncidentAssignments,
  patchIncidentStatus,
  updateIncidentAssignment,
} from "../services/IncidentService.js";
import "./IncidentOperations.css";

const transitions = {
  REPORTED: ["VALIDATED", "REJECTED"],
  VALIDATED: ["ASSIGNED", "REJECTED"],
  ASSIGNED: ["IN_PROGRESS", "VALIDATED"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CLOSED", "REOPENED"],
  REOPENED: ["ASSIGNED", "IN_PROGRESS"],
};
const labels = {
  VALIDATED: "Validada", REJECTED: "Rechazada", ASSIGNED: "Asignada",
  IN_PROGRESS: "En curso", RESOLVED: "Resuelta", CLOSED: "Cerrada",
  REOPENED: "Reabierta", COMPLETED: "Completada", CANCELLED: "Cancelada",
};

export default function IncidentOperations({ incident, role, onChanged }) {
  const canManage = role === "OPERATOR" || role === "ADMIN";
  const canViewAssignments = canManage || role === "TECHNICIAN";
  const [status, setStatus] = useState(transitions[incident.status]?.[0] || "");
  const [reason, setReason] = useState("");
  const [department, setDepartment] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!canViewAssignments) return;
    getIncidentAssignments(incident.id).then(setAssignments).catch((loadError) => setError(loadError.message));
  }, [incident.id, canViewAssignments]);

  async function changeStatus(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await patchIncidentStatus(incident.id, status, reason || null);
      setReason("");
      onChanged?.();
    } catch (submitError) { setError(submitError.message); }
    finally { setLoading(false); }
  }

  async function createAssignment(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const created = await createIncidentAssignment(incident.id, { department, notes: assignmentNotes || null });
      setAssignments((current) => [...current, created]);
      setDepartment("");
      setAssignmentNotes("");
      onChanged?.();
    } catch (submitError) { setError(submitError.message); }
    finally { setLoading(false); }
  }

  async function closeAssignment(assignmentId, nextStatus) {
    setLoading(true);
    setError("");
    try {
      const updated = await updateIncidentAssignment(incident.id, assignmentId, nextStatus);
      setAssignments((current) => current.map((item) => item.id === assignmentId ? updated : item));
    } catch (submitError) { setError(submitError.message); }
    finally { setLoading(false); }
  }

  return (
    <section className="incident-operations" aria-label="Gestión de incidencia">
      <div className="operations-heading"><strong>Gestión municipal</strong><span>{role}</span></div>
      {canManage && transitions[incident.status]?.length > 0 && (
        <form className="operation-form" onSubmit={changeStatus}>
          <label>Cambiar estado<select value={status} onChange={(event) => setStatus(event.target.value)}>{transitions[incident.status].map((value) => <option value={value} key={value}>{labels[value]}</option>)}</select></label>
          {status === "REJECTED" && <label>Motivo de rechazo<textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} required /></label>}
          <button type="submit" disabled={loading}>{loading ? "Guardando…" : "Guardar estado"}</button>
        </form>
      )}
      {canManage && ["VALIDATED", "REOPENED"].includes(incident.status) && (
        <form className="operation-form assignment-create" onSubmit={createAssignment}>
          <label>Asignar a un departamento<input value={department} onChange={(event) => setDepartment(event.target.value)} maxLength={120} placeholder="Ej. Alumbrado" required /></label>
          <label>Notas (opcional)<input value={assignmentNotes} onChange={(event) => setAssignmentNotes(event.target.value)} maxLength={1000} /></label>
          <button type="submit" disabled={loading}>{loading ? "Guardando…" : "Crear asignación"}</button>
        </form>
      )}
      {canViewAssignments && <div className="operations-assignments"><strong>Asignaciones</strong>{assignments.length === 0 ? <small>No hay asignaciones registradas.</small> : assignments.map((assignment) => <div className="operation-assignment" key={assignment.id}><div><b>{assignment.department}</b><span>{labels[assignment.status] || assignment.status}</span>{assignment.notes && <small>{assignment.notes}</small>}</div>{canManage && assignment.status === "ACTIVE" && <div className="assignment-buttons"><button type="button" disabled={loading} onClick={() => closeAssignment(assignment.id, "COMPLETED")}>Completar</button><button type="button" disabled={loading} onClick={() => closeAssignment(assignment.id, "CANCELLED")}>Cancelar</button></div>}</div>)}</div>}
      {error && <p className="operation-error" role="alert">{error}</p>}
    </section>
  );
}
