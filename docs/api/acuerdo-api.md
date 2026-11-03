# Diseño de API REST - UrbanPulse

La API entrega JSON, utiliza DTOs y responde con el formato común `ApiError`. Las fechas aceptan ISO-8601. Las operaciones de escritura usan **sesión web (cookie `HttpOnly`)** y requieren el **token CSRF**. Todas las entidades principales (`Incident`, `User`, `Assignment`, `Attachment`, `StatusChange`, `Notification`) se identifican mediante **`UUID` opacos**.

## 0. Principios generales

* **REST antes que REST-like:** no se usan verbos en la ruta (`/getIncidents`, `/createIncident` son incorrectos); la acción la expresa el método HTTP.
* **Interfaz uniforme:** mismo patrón predecible para todos los recursos (`GET`, `POST`, `PATCH` sobre `/recurso` y `/recurso/{id}`).
* **Autenticación por sesión:** la API usa **sesión web (cookie `HttpOnly`)** y **protección CSRF**.
* **Separación cliente/servidor** y **sistema por capas**.
* **DTOs como frontera:** nunca se exponen entidades de persistencia ni datos sensibles en respuestas públicas.

## 1. Convención de rutas

* Todas las rutas cuelgan del prefijo **`/api`** (p. ej. `/api/incidents`).
* Representan recursos mediante sustantivos en plural; la operación la indica el método HTTP.
* Un cambio compatible (añadir un campo opcional o un endpoint nuevo) no rompe a los clientes existentes y no requiere revisar el contrato.
* Un cambio incompatible (renombrar o eliminar campos, cambiar tipos o reglas de validación) obliga a revisar y actualizar este contrato.


## 2. Autenticación y cuentas

| Método y ruta | Acceso | Función |
|---|---|---|
| `GET /api/auth/csrf` | Público | Obtiene el token que debe enviarse como `X-XSRF-TOKEN` en operaciones de escritura. |
| `POST /api/auth/login` | Público (sin CSRF) | Inicia sesión con correo y contraseña y devuelve el perfil sin contraseña. |
| `GET /api/auth/me` | Sesión iniciada | Devuelve el perfil de la sesión actual. |
| `POST /api/auth/logout` | Sesión iniciada (sin CSRF) | Cierra la sesión, invalida la sesión y borra las cookies `JSESSIONID` y `XSRF-TOKEN`. Devuelve `204`. |
| `POST /api/users` | Público + CSRF | Registra una cuenta ciudadana con identificador `UUID`. El cliente no puede elegir su rol. |
| `POST /api/admin/users` | `ADMIN` + CSRF | Crea cuentas con rol municipal. |

Las contraseñas se guardan con **BCrypt**. La cookie de sesión es **`HttpOnly`**; la cookie `XSRF-TOKEN` permite al frontend adjuntar el token CSRF. El primer administrador se crea al iniciar el backend cuando están definidas `URBANPULSE_ADMIN_EMAIL` y `URBANPULSE_ADMIN_PASSWORD`. No se usan credenciales predeterminadas.

Roles disponibles: `CITIZEN`, `OPERATOR`, `TECHNICIAN`, `ADMIN` y `ANALYST`. El registro público siempre crea `CITIZEN`; solo `ADMIN` puede asignar otros roles.

## 3. Permisos

| Operación | Permiso |
|---|---|
| Listar/consultar incidencias, contexto urbano, duplicados, historial y descargar evidencias | Público |
| Registrar incidencias y subir evidencias | `CITIZEN`, `OPERATOR`, `ADMIN` |
| Cambiar estado de una incidencia | `OPERATOR`, `ADMIN` |
| Crear asignaciones | `OPERATOR`, `ADMIN` |
| Listar asignaciones | `OPERATOR`, `TECHNICIAN`, `ADMIN` |
| Cerrar o cancelar asignaciones | `OPERATOR`, `ADMIN` |
| Consultar indicadores analíticos y métricas territoriales | `OPERATOR`, `ADMIN`, `ANALYST` |
| Crear cuentas con roles municipales | `ADMIN` |
| Consultar, crear y marcar notificaciones | Sesión iniciada (cualquier rol) |

Las respuestas públicas no incluyen correos, contraseñas ni el identificador del reportero. La asociación de incidencias a cuentas ciudadanas y la vista de “mis incidencias” todavía no está modelada.

## 4. Incidencias (`/api/incidents`)

| Método y ruta | Función |
|---|---|
| `POST /api/incidents` | Registra una incidencia en `REPORTED`, crea su evento inicial y la enriquece con contexto urbano. Devuelve `201 Created`. |
| `GET /api/incidents` | Lista con `status`, `category`, `q`, `from`, `to`, `page`, `size` (1-100) y `sort`. |
| `GET /api/incidents/duplicates` | Detecta posibles incidencias duplicadas en un radio (metros) por coordenadas y categoría. |
| `GET /api/incidents/{id}` | Consulta el detalle de la incidencia. |
| `GET /api/incidents/{id}/context` | Consulta el contexto urbano enriquecido (barrio, distrito, clima, tráfico, observaciones y activos físicos cercanos). |
| `PATCH /api/incidents/{id}` | Cambia estado según la máquina de estados y conserva el motivo en historial. |
| `GET /api/incidents/{id}/status-changes` | Devuelve el historial cronológico. |

Ejemplo de listado: `GET /api/incidents?status=REPORTED&q=farola&page=0&size=10&sort=-createdAt`.
Ejemplo de duplicados: `GET /api/incidents/duplicates?latitude=36.7185&longitude=-4.4205&category=CALZADA&radiusMeters=50`.

El `PATCH` recibe `{"status":"VALIDATED","reason":"Datos suficientes"}`. `reason` es obligatorio para `REJECTED`. Transiciones admitidas: `REPORTED → VALIDATED/REJECTED`, `VALIDATED → ASSIGNED/REJECTED`, `ASSIGNED → IN_PROGRESS/VALIDATED`, `IN_PROGRESS → RESOLVED`, `RESOLVED → CLOSED/REOPENED` y `REOPENED → ASSIGNED/IN_PROGRESS`.

## 5. Contexto urbano y activos físicos

El contexto urbano se captura de forma automática al crear una incidencia y se consulta mediante `GET /api/incidents/{id}/context`. El contrato aplica **degradación controlada**: si una fuente externa falla, el registro y la consulta nunca se bloquean; los campos no disponibles toman valores de fallback.

El contexto incluye:

* **Territorio:** barrio, distrito y dirección postal aproximada en Málaga.
* **Activos físicos cercanos:** elementos urbanos (semáforos, paradas de autobús, farolas) en un radio de 100 m.
* **Variables ambientales:** clima (temperatura, humedad) y estado del tráfico.
* **Observaciones externas:** datos de fuentes de terceros asociados a la ubicación.

## 6. Analítica e indicadores territoriales (`/api/analytics`)

| Método y ruta | Acceso | Función |
|---|---|---|
| `GET /api/analytics/summary` | `OPERATOR`, `ADMIN`, `ANALYST` | Devuelve totales acumulados, desglose por estado, por categoría, por distrito territorial y conteos de los últimos 7 y 30 días. |

## 7. Asignaciones (`/api/incidents/{id}/assignments`)

La asignación es un subrecurso cuya existencia depende de la incidencia:

| Método y ruta | Función |
|---|---|
| `POST /api/incidents/{id}/assignments` | Asigna una incidencia validada o reabierta a un departamento y opcionalmente equipo/técnico. Devuelve `201 Created`. |
| `GET /api/incidents/{id}/assignments` | Lista las asignaciones. |
| `PATCH /api/incidents/{id}/assignments/{assignmentId}` | Cierra una asignación activa como `COMPLETED` o `CANCELLED`. |

Las notas de un `PATCH` se agregan a las notas existentes. Cerrar una asignación no resuelve automáticamente la incidencia.

## 8. Evidencias (`/api/incidents/{id}/attachments`)

| Método y ruta | Función |
|---|---|
| `POST /api/incidents/{id}/attachments` | Sube `multipart/form-data` con campo `file`. Hasta 4 evidencias por incidencia, JPG/PNG/WEBP/PDF, máximo 10 MB cada una. |
| `GET /api/incidents/{id}/attachments` | Lista metadatos. |
| `GET /api/incidents/{id}/attachments/{attachmentId}` | Descarga el archivo. |

Los bytes se guardan fuera de PostgreSQL en `uploads/attachments` por defecto. Configura `ATTACHMENTS_DIRECTORY` con almacenamiento persistente al desplegar.



## 9. CSRF y autenticación por sesión

La API usa **sesión web** con cookie `HttpOnly` y **protección CSRF**.

* La cookie de sesión es **`HttpOnly`** (JavaScript no puede leerla).
* El servidor emite una cookie **`XSRF-TOKEN`** legible por el frontend; el cliente debe reenviar su valor en la cabecera **`X-XSRF-TOKEN`** en las operaciones de escritura protegidas.
* Si el token CSRF falta o no coincide, la operación se rechaza con **`403`**.
* `POST /api/auth/login` y `POST /api/auth/logout` están **exentos de CSRF** por configuración.
* Flujo típico del cliente:
  1. `GET /api/auth/csrf` (fija la cookie `XSRF-TOKEN`).
  2. `POST /api/auth/login` (sin cabecera CSRF).
  3. Operaciones de escritura protegidas enviando **`X-XSRF-TOKEN`**.
* **En producción** la API debe servirse detrás de **HTTPS** para proteger credenciales y cookies en tránsito.
* No se almacenan credenciales ni secretos en el cliente; el primer administrador se crea por variables de entorno.

## 10. Notificaciones (`/api/notifications`)

| Método y ruta | Función |
|---|---|
| `POST /api/notifications` | Crea una notificación para un destinatario. Devuelve `201 Created`. |
| `GET /api/notifications/user/{userId}` | Lista las notificaciones de un usuario; `unreadOnly` (por defecto `false`) filtra las no leídas. |
| `GET /api/notifications/user/{userId}/unread-count` | Devuelve el número de notificaciones no leídas. |
| `PATCH /api/notifications/{id}/read` | Marca una notificación como leída y devuelve su representación. |

Tipos de notificación: `INCIDENT_CREATED`, `STATUS_CHANGED`, `ASSIGNED_TO_DEPARTMENT`, `TECHNICAL_UPDATE` y `SYSTEM_ALERT`.

Ejemplo de notificación (`GET /api/notifications/user/{userId}`):

```json
{
  "id": "d1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f60",
  "recipientId": "c2e4a6b8-0d1f-4a3b-8c5d-7e9f1a2b3c4d",
  "incidentId": "b3f1c2a4-1e2d-4c5b-8a9f-0d1e2f3a4b5c",
  "title": "Incidencia asignada",
  "message": "Se le ha asignado la incidencia de alumbrado.",
  "type": "ASSIGNED_TO_DEPARTMENT",
  "read": false,
  "createdAt": "2026-10-02T12:00:00",
  "readAt": null
}
```

## 11. Estructura común de errores (`ApiError`)

Las respuestas de error incluyen `type`, `title`, `status`, `code`, `detail`, `instance`, `requestId` y, en validaciones, `errors`. Se separan cinco responsabilidades: el código HTTP, el código interno del backend (`code`), el mensaje humano (`title`/`detail`), los detalles de campo (`errors`) y el identificador de trazabilidad (`requestId`).

* El cliente debe comparar el campo `code`, **nunca** cadenas de mensaje traducibles o cambiantes.
* **Nunca** se exponen detalles internos (SQL, nombres de tablas, restricciones, trazas).

Ejemplo de error de validación:

```json
{
  "type": "https://api.urbanpulse.com/problems/validation-error",
  "title": "Validation failed",
  "status": 422,
  "code": "VALIDATION_ERROR",
  "detail": "Two fields contain invalid values.",
  "instance": "/api/incidents",
  "requestId": "req_8Xy3Z",
  "errors": [
    {
      "field": "title",
      "code": "MISSING_FIELD",
      "message": "The title is required."
    },
    {
      "field": "latitude",
      "code": "OUT_OF_RANGE",
      "message": "Latitude must be between -90 and 90."
    }
  ]
}
```

## 12. Identificador de petición (X-Request-ID)

* El backend genera un identificador (UUID) por petición y lo devuelve en la cabecera de respuesta `X-Request-ID`.
* El mismo valor se registra en los logs, permitiendo correlacionar la respuesta del cliente con las trazas internas.
* En errores, ese identificador aparece también en el campo `requestId` del cuerpo de error.

```
HTTP/1.1 200 OK
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

## 13. Filtros, ordenación y paginación

### 13.1. Filtros y búsqueda

* Filtros como query parameters combinables: `GET /api/incidents?status=REPORTED&category=...&q=farola&from=...&to=...`.
* No se crean endpoints independientes por filtro.
* Ordenación: `?sort=-createdAt` (el prefijo `-` indica orden descendente); `sort` y los filtros se combinan.
* Búsqueda textual con `q`; los filtros estructurados se mantienen como query parameters.

### 13.2. Paginación

Los listados se paginan con `page` (base 0, por defecto 0) y `size` (1-100, por defecto 20). Ejemplo: `?page=0&size=10&sort=-createdAt`. La respuesta usa el formato de página de Spring:

```json
{
  "content": [
    { "id": "INC-1024", "title": "Semáforo averiado", "status": "VALIDATED" }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 135,
  "totalPages": 14
}
```

* Nunca se devuelven colecciones completas sin límite.

## 14. Estructura de respuestas (DTOs)

Para evitar exponer el modelo de base de datos, las respuestas utilizan DTOs en JSON y omiten campos sensibles en contextos públicos.

Ejemplo de incidencia (`GET /api/incidents/{id}`):

```json
{
  "id": "b3f1c2a4-1e2d-4c5b-8a9f-0d1e2f3a4b5c",
  "title": "Semáforo averiado en Alameda Principal",
  "description": "El semáforo de peatones no cambia a verde.",
  "category": "TRAFFIC_LIGHT",
  "status": "VALIDATED",
  "createdAt": "2026-10-02T10:30:00",
  "location": {
    "latitude": 36.7184,
    "longitude": -4.4201
  }
}
```

En las búsquedas por duplicados, cada elemento puede incluir además `distanceMeters`.

Ejemplo de asignación (`GET /api/incidents/{id}/assignments`):

```json
{
  "id": "7a1d9c2e-5f43-4b1a-9c22-6d7e8f9a0b1c",
  "incidentId": "b3f1c2a4-1e2d-4c5b-8a9f-0d1e2f3a4b5c",
  "department": "MOBILITY",
  "teamId": "c2e4a6b8-0d1f-4a3b-8c5d-7e9f1a2b3c4d",
  "technicianId": null,
  "status": "ASSIGNED",
  "notes": "Se envía equipo de señalización.",
  "assignedAt": "2026-10-02T12:00:00",
  "completedAt": null
}
```

## 15. Fuera del alcance actual

Quedan pendientes la asociación de reportes al ciudadano para consultar únicamente sus propios avisos en un panel personal, la recuperación de contraseña y la verificación de correo.
