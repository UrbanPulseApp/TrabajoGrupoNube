const API_URL = (import.meta.env.VITE_API_URL || "/api/incidents").replace(/\/$/, "");

export function getIncidentAttachmentUrl(incidentId, attachmentId) {
    return `${API_URL}/${incidentId}/attachments/${attachmentId}`;
}

export async function createIncident(incident) {

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(incident)
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.detail || data?.message || "Error al crear la incidencia"
        );
    }

    return data;
}

export async function getIncident(id) {

    const response = await fetch(`${API_URL}/${id}`);

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.detail || data?.message || "No se ha podido obtener la incidencia");
    }
    return data;
}

export async function getIncidents(filters = {}, signal) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") params.set(key, value);
    });
    const response = await fetch(`${API_URL}?${params.toString()}`, { signal });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.detail || data?.message || "No se pudo cargar el listado de incidencias");
    }
    return data;
}

export async function getIncidentStatusChanges(id) {
    const response = await fetch(`${API_URL}/${id}/status-changes`);
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.detail || data?.message || "No se pudo cargar el historial");
    }
    return data;
}

export async function uploadIncidentAttachment(incidentId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_URL}/${incidentId}/attachments`, {
        method: "POST",
        body: formData,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.detail || data?.message || `No se pudo subir ${file.name}`);
    }
    return data;
}

export async function getIncidentAttachments(incidentId) {
    const response = await fetch(`${API_URL}/${incidentId}/attachments`);
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.detail || data?.message || "No se pudieron cargar las evidencias");
    }
    return data;
}
