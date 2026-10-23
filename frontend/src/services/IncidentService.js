const API_URL = import.meta.env.VITE_API_URL || "/api/incidents";

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
