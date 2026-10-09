const API_URL = "/api/incidents";

export async function createIncident(incident) {

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(incident)
    });

    if (!response.ok) {

        const errorData = await response.json();

        throw new Error(
            errorData.message || "Error al crear la incidencia"
        );
    }

    return await response.json();
}

export async function getIncident(id) {

    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) {
        throw new Error("No se ha podido obtener la incidencia");
    }

    return await response.json();
}