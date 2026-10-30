# API REST - UrbanPulse

La API entrega JSON, utiliza DTOs y responde con el formato común `ApiError`. Las fechas aceptan ISO-8601. Las operaciones de escritura usan sesión web y requieren el token CSRF.

## Autenticación y cuentas

| Método y ruta | Acceso | Función |
|---|---|---|
| `GET /api/auth/csrf` | Público | Obtiene el token que debe enviarse como `X-XSRF-TOKEN` en operaciones de escritura. |
| `POST /api/auth/login` | Público + CSRF | Inicia sesión con correo y contraseña y devuelve el perfil sin contraseña. |
| `GET /api/auth/me` | Sesión iniciada | Devuelve el perfil de la sesión actual. |
| `POST /api/auth/logout` | Sesión iniciada + CSRF | Cierra la sesión. |
| `POST /api/users` | Público + CSRF | Registra una cuenta ciudadana. El cliente no puede elegir su rol. |
| `POST /api/admin/users` | `ADMIN` + CSRF | Crea cuentas con rol municipal. |

Las contraseñas se guardan con BCrypt. La cookie de sesión es `HttpOnly`; la cookie `XSRF-TOKEN` permite al frontend adjuntar el token CSRF. El primer administrador se crea al iniciar el backend cuando están definidas `URBANPULSE_ADMIN_EMAIL` y `URBANPULSE_ADMIN_PASSWORD`. No se usan credenciales predeterminadas.

Roles disponibles: `CITIZEN`, `OPERATOR`, `TECHNICIAN`, `ADMIN` y `ANALYST`. El registro público siempre crea `CITIZEN`; solo `ADMIN` puede asignar otros roles.

## Permisos

| Operación | Permiso |
|---|---|
| Listar/consultar incidencias, historial y descargar evidencias | Público |
| Registrar incidencias y subir evidencias | `CITIZEN`, `OPERATOR`, `ADMIN` |
| Cambiar estado de una incidencia | `OPERATOR`, `ADMIN` |
| Crear asignaciones | `OPERATOR`, `ADMIN` |
| Listar asignaciones | `OPERATOR`, `TECHNICIAN`, `ADMIN` |
| Cerrar o cancelar asignaciones | `OPERATOR`, `ADMIN` |
| Crear cuentas con roles municipales | `ADMIN` |

Las respuestas públicas no incluyen correos, contraseñas ni el identificador del reportero. La asociación de incidencias a cuentas ciudadanas y la vista de “mis incidencias” todavía no está modelada.

## Incidencias

| Método y ruta | Función |
|---|---|
| `POST /api/incidents` | Registra una incidencia en `REPORTED` y crea su evento inicial. |
| `GET /api/incidents` | Lista con `status`, `category`, `q`, `from`, `to`, `page`, `size` (1-100) y `sort`. |
| `GET /api/incidents/{id}` | Consulta el detalle. |
| `PATCH /api/incidents/{id}` | Cambia estado según la máquina de estados y conserva el motivo en historial. |
| `GET /api/incidents/{id}/status-changes` | Devuelve el historial cronológico. |

Ejemplo: `GET /api/incidents?status=REPORTED&q=farola&page=0&size=10&sort=-createdAt`.

El PATCH recibe `{"status":"VALIDATED","reason":"Datos suficientes"}`. `reason` es obligatorio para `REJECTED`. Transiciones admitidas: `REPORTED → VALIDATED/REJECTED`, `VALIDATED → ASSIGNED/REJECTED`, `ASSIGNED → IN_PROGRESS/VALIDATED`, `IN_PROGRESS → RESOLVED`, `RESOLVED → CLOSED/REOPENED` y `REOPENED → ASSIGNED/IN_PROGRESS`.

## Asignaciones

| Método y ruta | Función |
|---|---|
| `POST /api/incidents/{id}/assignments` | Asigna una incidencia validada o reabierta a un departamento y opcionalmente equipo/técnico. |
| `GET /api/incidents/{id}/assignments` | Lista las asignaciones. |
| `PATCH /api/incidents/{id}/assignments/{assignmentId}` | Cierra una asignación activa como `COMPLETED` o `CANCELLED`. |

Las notas de un PATCH se agregan a las notas existentes. Cerrar una asignación no resuelve automáticamente la incidencia.

## Evidencias

| Método y ruta | Función |
|---|---|
| `POST /api/incidents/{id}/attachments` | Sube `multipart/form-data` con campo `file`. Hasta 4 evidencias por incidencia, JPG/PNG/WEBP/PDF, máximo 10 MB cada una. |
| `GET /api/incidents/{id}/attachments` | Lista metadatos. |
| `GET /api/incidents/{id}/attachments/{attachmentId}` | Descarga el archivo. |

Los bytes se guardan fuera de PostgreSQL en `uploads/attachments` por defecto. Configura `ATTACHMENTS_DIRECTORY` con almacenamiento persistente al desplegar.

## Errores

Las respuestas de error incluyen `type`, `title`, `status`, `code`, `detail`, `instance`, `requestId` y, en validaciones, `errors`. `X-Request-ID` también se incluye en la respuesta. Códigos usuales: `400` entrada inválida, `401` sesión ausente o credenciales inválidas, `403` rol insuficiente/CSRF, `404` recurso inexistente, `409` correo duplicado, `413` archivo grande y `422` regla de dominio.

## Fuera del alcance actual

`UrbanAsset`, `ExternalObservation` y `UrbanContext` siguen pendientes. También quedan pendientes la asociación de reportes al ciudadano para consultar únicamente sus propios avisos, recuperación de contraseña y verificación de correo.
