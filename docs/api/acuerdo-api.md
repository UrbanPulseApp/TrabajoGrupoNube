# Diseño de API REST - UrbanPulse

La API utiliza JSON, rutas centradas en recursos y DTOs separados del modelo JPA. Las fechas de búsqueda usan ISO-8601 (`yyyy-MM-dd'T'HH:mm:ss`). El identificador de incidencia y adjunto es UUID.

## Incidencias

| Método y ruta | Función |
|---|---|
| `POST /api/incidents` | Registra una incidencia en estado `REPORTED` y crea su primer evento de historial. |
| `GET /api/incidents` | Lista incidencias paginadas; acepta `status`, `category`, `q`, `from`, `to`, `page`, `size` (1-100) y `sort`. |
| `GET /api/incidents/{id}` | Consulta el detalle. |
| `PATCH /api/incidents/{id}` | Cambia el estado respetando la máquina de estados; guarda el motivo en el historial. |
| `GET /api/incidents/{id}/status-changes` | Devuelve el historial cronológico de estados. |

Ejemplo de búsqueda: `GET /api/incidents?status=REPORTED&q=farola&page=0&size=10&sort=-createdAt`.

El cambio de estado recibe `{"status":"VALIDATED","reason":"Datos suficientes"}`. `reason` es obligatorio al rechazar. Las transiciones admitidas son `REPORTED → VALIDATED/REJECTED`, `VALIDATED → ASSIGNED/REJECTED`, `ASSIGNED → IN_PROGRESS/VALIDATED`, `IN_PROGRESS → RESOLVED`, `RESOLVED → CLOSED/REOPENED` y `REOPENED → ASSIGNED/IN_PROGRESS`.

## Asignaciones

| Método y ruta | Función |
|---|---|
| `POST /api/incidents/{id}/assignments` | Asigna una incidencia validada o reabierta a un departamento y opcionalmente a equipo/técnico. |
| `GET /api/incidents/{id}/assignments` | Lista sus asignaciones. |
| `PATCH /api/incidents/{id}/assignments/{assignmentId}` | Finaliza una asignación activa como `COMPLETED` o `CANCELLED`; opcionalmente agrega notas. |

Solo se admite una asignación activa por incidencia. La finalización de una asignación no resuelve automáticamente la incidencia: esa transición requiere validación operativa explícita.

## Evidencias

| Método y ruta | Función |
|---|---|
| `POST /api/incidents/{id}/attachments` | Sube un archivo multipart con el campo `file`. Admite hasta 4 evidencias por incidencia, JPG, PNG, WEBP y PDF, hasta 10 MB cada archivo. |
| `GET /api/incidents/{id}/attachments` | Lista metadatos de evidencias. |
| `GET /api/incidents/{id}/attachments/{attachmentId}` | Descarga una evidencia. |

Los bytes se almacenan fuera de PostgreSQL en el directorio `uploads/attachments` por defecto. Puede cambiarse con `ATTACHMENTS_DIRECTORY`; en despliegue debe montarse como volumen persistente y respaldarse.

## Errores

Los errores devuelven `type`, `title`, `status`, `code`, `detail`, `instance`, `requestId` y, para validaciones, `errors`:

```json
{
  "type": "https://api.urbanpulse.com/problems/validation_error",
  "title": "Validation failed",
  "status": 422,
  "code": "VALIDATION_ERROR",
  "detail": "One or more fields contain invalid values.",
  "instance": "/api/incidents",
  "requestId": "uuid",
  "errors": [{"field": "title", "code": "INVALID_FIELD", "message": "El título es obligatorio"}]
}
```

`400` representa parámetros o JSON inválidos, `404` recursos inexistentes, `413` archivos demasiado grandes, `422` validación de dominio y `500` errores inesperados. No se exponen trazas al cliente.

## Límites actuales

La API aún no aplica autenticación/autorización por roles. Los endpoints de consulta son públicos y las transiciones operativas no deben exponerse en producción hasta incorporar RBAC. `UrbanAsset`, `ExternalObservation` y `UrbanContext` permanecen fuera del alcance de la implementación actual; no bloquean el registro de incidencias.
