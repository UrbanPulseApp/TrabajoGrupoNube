# Diseño de API REST - UrbanPulse

Este documento define el contrato de la API para UrbanPulse. La API debe estar centrada en recursos (usando sustantivos en plural) y no en acciones, delegando la intención de la operación al método HTTP. El método indica la operación; la URL identifica el recurso.

## 0. Principios generales

* **REST antes que REST-like:** no se usan verbos en la ruta (`/getIncidents`, `/createIncident` son incorrectos); la acción la expresa el método HTTP.
* **Interfaz uniforme:** mismo patrón predecible para todos los recursos (`GET`, `POST`, `PUT`/`PATCH`, `DELETE` sobre `/recurso` y `/recurso/{id}`).
* **Sin estado (stateless):** cada petición es autocontenida; la autenticación viaja en cada petición mediante `Authorization: Bearer <token>`. El servidor no guarda sesión en memoria.
* **Cacheable:** se usan cabeceras de caché (`Cache-Control`, `ETag`) en recursos de lectura cuando aplique.
* **Separación cliente/servidor** y **sistema por capas** (la API puede ir detrás de un API Gateway o balanceador).
* **DTOs** como frontera: nunca se exponen entidades de persistencia directamente.

## 1. Versionado de la API

Los cambios incompatibles en el contrato se introducen mediante versionado explícito en la ruta:

```
/api/v1/incidents
/api/v2/incidents
```

* Se cambia de versión cuando el contrato introduce una incompatibilidad **observable para el cliente** (renombrar/quitar campos, cambiar tipos, cambiar reglas de validación o significados).
* Los cambios compatibles (añadir un campo opcional, añadir un endpoint nuevo) no requieren nueva versión.
* Cada versión tiene un ciclo de retirada definido y documentado.

> Nota: el prefijo `/api/v1` es el objetivo del contrato. En los ejemplos se muestra sin `v1` por brevedad; en la implementación debe fijarse un único criterio, siendo `/api/v1` el recomendado.

## 2. Rutas Principales (Endpoints)

### 2.1 Recurso: Incidencias (/api/incidents)

* **POST /api/incidents**: Registra un nuevo reporte. Devuelve `201 Created` con cabecera `Location` apuntando al recurso creado.
* **GET /api/incidents**: Obtiene el catálogo de incidencias. Los filtros, la ordenación y la paginación se aplican mediante parámetros de consulta (query parameters), por ejemplo: `?status=VALIDATED&sort=-priority`.
* **GET /api/incidents/{id}**: Consulta los detalles de una incidencia específica identificada por su parámetro de ruta (path parameter).
* **PUT /api/incidents/{id}**: Reemplaza **completamente** la incidencia (el cuerpo debe ser la representación completa).
* **PATCH /api/incidents/{id}**: Modifica **parcialmente** un recurso, enviando en el cuerpo (body) únicamente los campos que deben cambiar (ej. asignar un técnico).
* **DELETE /api/incidents/{id}**: Elimina la incidencia. Devuelve `204 No Content`.

### 2.2 Asignaciones de una incidencia (/api/incidents/{id}/assignments)

La asignación es un subrecurso cuya existencia depende de la incidencia (jerarquía con dependencia):

* **POST /api/incidents/{id}/assignments**: Asigna la incidencia a un destino operativo. Devuelve `201 Created` con `Location`. Operación **idempotente**: no crea duplicados; si ya existe una asignación activa para el mismo destino, devuelve `409 Conflict` (o la existente).
* **GET /api/incidents/{id}/assignments**: Lista las asignaciones de la incidencia (admite paginación).

### 2.3 Acciones de dominio

Las operaciones de negocio que no encajan en CRUD se modelan como **acciones sobre el recurso**, no como un `PATCH` que cambia un estado a ciegas:

* **POST /api/incidents/{id}/cancellation**: Cancela una incidencia. El cuerpo puede incluir el motivo (`{ "reason": "duplicate" }`).
* **POST /api/incidents/{id}/confirmation**: Confirma una incidencia pendiente de validación.

Una acción de dominio representa una **intención propia** con reglas y efectos secundarios, no una modificación arbitraria de campos.

### 2.4 Recurso: Usuarios (/api/users)

* **POST /api/users**: Crea un nuevo usuario en la plataforma.
* **GET /api/users**: Lista usuarios (paginado).
* **GET /api/users/{id}**: Recupera la información detallada de un usuario.

La representación de creación (con `password`) es **distinta** de la de respuesta; la contraseña **nunca** aparece en ninguna respuesta.

### 2.5 Recurso: Contexto urbano (/api/incidents/{id}/context)

* **GET /api/incidents/{id}/context**: Recupera el contexto urbano (localización, meteorología, tráfico y observaciones externas) asociado a la incidencia.

## 3. Métodos HTTP y su semántica

| Método | Uso | Idempotente | Cuerpo |
|---|---|---|---|
| GET | Consultar recursos | Sí | No |
| POST | Crear recurso o ejecutar acción | Normalmente no | Sí |
| PUT | Reemplazar un recurso completo | Sí | Sí |
| PATCH | Modificar parcialmente | No garantizado | Sí |
| DELETE | Eliminar un recurso | Sí (estado final "no existe") | No |

* **POST** lo decide el servidor (asigna el `id`). Repetirlo puede crear duplicados; cuando la operación deba ser idempotente (p. ej. asignar), se valida y se devuelve el estado existente en lugar de duplicar.
* **PUT** requiere enviar la representación completa del recurso.
* **PATCH** envía solo los campos que cambian.

## 4. Códigos de Estado HTTP

**Éxito (2xx):**
* **200 OK**: La operación se realizó correctamente.
* **201 Created**: El recurso se creó con éxito tras una petición POST. Incluye cabecera `Location`.
* **204 No Content**: Operación correcta, pero sin cuerpo de respuesta.

**Redirección (3xx):** poco habituales en la API; `304 Not Modified` puede usarse con caché.

**Errores del Cliente (4xx):**
* **400 Bad Request**: La petición está mal formada (JSON inválido, parámetros incorrectos).
* **401 Unauthorized**: Falta autenticación o el token es inválido.
* **403 Forbidden**: El usuario está autenticado pero carece de permisos para realizar esa acción.
* **404 Not Found**: El recurso o identificador solicitado no existe.
* **409 Conflict**: Conflicto con el estado actual (p. ej. recurso duplicado o asignación ya existente).
* **422 Unprocessable Entity**: Los datos tienen el formato correcto, pero fallan en las reglas de validación del dominio.

**Errores del Servidor (5xx):**
* **500 Internal Server Error**: Error interno e inesperado en el servidor.
* **503 Service Unavailable**: El servicio externo o la base de datos no están disponibles.

## 5. Estructura Común de Errores

Se separan cinco responsabilidades: el código HTTP, el código interno del backend (`code`), el mensaje humano (`title`/`detail`), los detalles de campo (`errors`) y el identificador de trazabilidad (`requestId`).

* El cliente debe comparar el campo `code`, **nunca** cadenas de mensaje traducibles o cambiantes.
* **Nunca** se exponen detalles internos (SQL, nombres de tablas, restricciones, trazas).

Todos los errores devueltos por la API de UrbanPulse seguirán estrictamente este formato unificado. Ejemplo de respuesta para un error de validación:

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

Ejemplo de conflicto de recurso existente:

```json
{
  "type": "https://api.urbanpulse.com/problems/conflict",
  "title": "Resource already exists",
  "status": 409,
  "code": "ASSIGNMENT_ALREADY_EXISTS",
  "detail": "The incident already has an active assignment for this destination.",
  "instance": "/api/incidents/INC-1024/assignments",
  "requestId": "req_8Xy3Z"
}
```

## 6. Identificador de petición (X-Request-ID)

* El backend genera un identificador (UUID) por petición y lo devuelve en la cabecera de respuesta `X-Request-ID`.
* El mismo valor se registra en los logs, permitiendo correlacionar la respuesta del cliente con las trazas internas.
* En errores, ese identificador aparece también en el campo `requestId` del cuerpo de error.

```
HTTP/1.1 200 OK
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

## 7. Cabeceras HTTP relevantes

| Cabecera | Uso | Ejemplo |
|---|---|---|
| `Content-Type` | Formato del cuerpo enviado | `application/json` |
| `Accept` | Formato esperado por el cliente | `application/json` |
| `Authorization` | Credenciales o token | `Bearer <token>` |
| `Location` | URL del recurso recién creado | `/api/incidents/INC-1024` |
| `X-Request-ID` | Trazabilidad de la petición | `550e8400-...` |

## 8. Filtros, ordenación y paginación

### 8.1 Filtros y búsqueda
* Filtros como query parameters combinables: `GET /api/incidents?status=VALIDATED&priority=HIGH&category=TRAFFIC_LIGHT`.
* No se crean endpoints independientes por filtro.
* Ordenación: `?sort=createdAt,-priority` (prefijo `-` indica descendente). Alternativa: `?sortBy=createdAt&order=desc`.
* Búsqueda textual sobre colecciones conocidas: `GET /api/incidents?q=semaforo`; los filtros estructurados se mantienen como query parameters.

### 8.2 Paginación
Toda colección devuelve una envoltura con metadatos de navegación, no un array plano:

```json
{
  "items": [
    { "id": "INC-1024", "title": "Semáforo averiado", "status": "VALIDATED" }
  ],
  "pagination": {
    "page": 2,
    "pageSize": 20,
    "totalItems": 135,
    "totalPages": 7
  }
}
```

* Se admite **paginación por página** (`?page=2&pageSize=20`) y, para grandes volúmenes o colecciones cambiantes, **paginación por cursor** (`?pageSize=20&pageToken=<opaco>`), tratando el token como opaco.
* Nunca se devuelven colecciones completas sin límite.

## 9. Estructura de Respuestas (DTOs)

Para evitar exponer el modelo de base de datos directamente, las respuestas utilizarán DTOs (Data Transfer Objects) en formato JSON.

Ejemplo de respuesta para una Incidencia (`GET /api/incidents/{id}`):

```json
{
  "id": "INC-1024",
  "title": "Semáforo averiado en Alameda Principal",
  "description": "El semáforo de peatones no cambia a verde.",
  "status": "VALIDATED",
  "category": "TRAFFIC_LIGHT",
  "priority": "HIGH",
  "location": {
    "latitude": 36.7184,
    "longitude": -4.4201,
    "district": "Centro"
  },
  "createdAt": "2026-10-02T10:30:00Z",
  "updatedAt": "2026-10-02T11:05:00Z"
}
```

Ejemplo de respuesta para una Asignación (`GET /api/incidents/{id}/assignments`):

```json
{
  "id": "ASG-77",
  "incidentId": "INC-1024",
  "department": "MOBILITY",
  "teamId": "TEAM-3",
  "technicianId": "USR-12",
  "status": "ACTIVE",
  "notes": "Se envía equipo de señalización.",
  "assignedAt": "2026-10-02T12:00:00+02:00",
  "completedAt": null
}
```

## 10. Convenciones de datos

* **Nombres consistentes:** `camelCase` en JSON, sin abreviaturas oscuras, mismo término para el mismo concepto (no mezclar `customer`/`client`/`user`).
* **Fechas y horas:** instantes en formato ISO-8601 con zona horaria. `createdAt`, `updatedAt`, `assignedAt` representan un **instante global** (`2026-10-02T10:30:00Z`). Para citas civiles sin hora se usa `2026-10-02`; para hora local con offset, `2026-10-02T10:30:00+02:00`.
* **Unidades explícitas:** magnitudes con su unidad o moneda (`{ "amount": 1999, "currency": "EUR" }`; distancias en metros indicadas en el nombre del campo, p. ej. `precisionMeters`).
* **Semántica de nulos y colecciones:** el contrato distingue *campo ausente* (no aplica / no enviado), `null` (valor conocido como nulo), cadena vacía y colección vacía. `[]` significa "sin elementos", no "desconocido".
* **Identificadores:** los identificadores son **opacos** para el cliente; no se deriva información de su formato ni se asume su tipo interno.

## 11. Extensión de respuestas

Para relaciones se usa referencia simple por defecto (`"technicianId": "USR-12"`). Cuando se necesite más detalle, se permite **expansión controlada** (`?expand=technician`), limitando relaciones, profundidad y número total, y vigilando fuga de datos sensibles, consultas N+1 y latencia. La selección de campos (`?fields=id,title,status`) es opcional y debe limitarse por permisos.