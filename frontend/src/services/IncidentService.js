import { apiFetch, responseError } from "./ApiClient.js";

const API_URL = (import.meta.env.VITE_API_URL || "/api/incidents").replace(/\/$/, "");

export function getIncidentAttachmentUrl(incidentId, attachmentId) {
    return `${API_URL}/${incidentId}/attachments/${attachmentId}`;
}

export async function createIncident(incident) {

    const response = await apiFetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(incident)
    });

    if (!response.ok) {
        throw await responseError(response, "Error al crear la incidencia");
    }

    return response.json();
}

export async function getIncident(id) {

    const response = await apiFetch(`${API_URL}/${id}`);
    if (!response.ok) {
        throw await responseError(response, "No se ha podido obtener la incidencia");
    }
    return response.json();
}

export async function getIncidents(filters = {}, signal) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") params.set(key, value);
    });
    const response = await apiFetch(`${API_URL}?${params.toString()}`, { signal });
    if (!response.ok) {
        throw await responseError(response, "No se pudo cargar el listado de incidencias");
    }
    return response.json();
}

export async function getIncidentStatusChanges(id) {
    const response = await apiFetch(`${API_URL}/${id}/status-changes`);
    if (!response.ok) {
        throw await responseError(response, "No se pudo cargar el historial");
    }
    return response.json();
}

export async function uploadIncidentAttachment(incidentId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiFetch(`${API_URL}/${incidentId}/attachments`, {
        method: "POST",
        body: formData,
    });
    if (!response.ok) {
        throw await responseError(response, `No se pudo subir ${file.name}`);
    }
    return response.json();
}

export async function getIncidentAttachments(incidentId) {
    const response = await apiFetch(`${API_URL}/${incidentId}/attachments`);
    if (!response.ok) {
        throw await responseError(response, "No se pudieron cargar las evidencias");
    }
    return response.json();
}

export async function patchIncidentStatus(incidentId, status, reason) {
    const response = await apiFetch(`${API_URL}/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
    });
    if (!response.ok) throw await responseError(response, "No se pudo cambiar el estado");
    return response.json();
}

export async function getIncidentAssignments(incidentId) {
    const response = await apiFetch(`${API_URL}/${incidentId}/assignments`);
    if (!response.ok) throw await responseError(response, "No se pudieron cargar las asignaciones");
    return response.json();
}

export async function createIncidentAssignment(incidentId, assignment) {
    const response = await apiFetch(`${API_URL}/${incidentId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignment),
    });
    if (!response.ok) throw await responseError(response, "No se pudo crear la asignación");
    return response.json();
}

export async function updateIncidentAssignment(incidentId, assignmentId, status, notes) {
    const response = await apiFetch(`${API_URL}/${incidentId}/assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
    });
    if (!response.ok) throw await responseError(response, "No se pudo actualizar la asignación");
    return response.json();
}
