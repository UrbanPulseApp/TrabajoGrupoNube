# Documento de diseño — UrbanPulse, iteración 2

> **Documento único de la iteración.** Reúne todas las propuestas de diseño de la iteración 2 (F1–F5 y RA1–RA4) para validarlas con el cliente. Cada sección tiene un responsable (ver la tabla *Responsables por sección*). Edita solo tus secciones, en tu rama, y sigue las convenciones del [README](README.md). Sustituye los `[campos entre corchetes]` y borra las indicaciones cuando ya no hagan falta.
>
> **Versión preliminar (v0.1):** se entrega en el Campus Virtual hasta el **lunes 30-11-2026 a las 23:59**. Según el profesor, *«basta con que estén explicados los cambios que vais a realizar»*. Las partes marcadas con ★ son el mínimo para esa entrega; el resto se completa antes de la validación con el cliente.

| Metadato | Valor |
|---|---|
| Estado | Borrador (en preparación la v0.1, versión preliminar) |
| Autoría | @NachoGarcia15, @JavierSantiburcio, @MarioMerZap, @IvanPDcode, @GregorioMerchan |
| Fecha de creación / última revisión | 2026-11-17 / 2026-11-25 |
| Iteración | 2 — Evolución de monolito modular a monolito + microservicios |
| Revisores | [Personas o roles] |
| Aprobación del cliente | Pendiente — ver [acta](validacion-cliente.md) |
| Prefijos de decisiones | `D-ARQ`, `D-F1` … `D-F5`, `D-RA1` … `D-RA4` |
| Enlaces | Épica [#80](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/80), [C4](../diagrama-C4/), [acuerdo-api](../api/acuerdo-api.md), [ADRs](../adr/) |

### Responsables por sección

| Sección | Contenido | Responsables | Issue |
|---|---|---|---|
| §1, §2, §3, §8, §9, §11, §12, §13 | Secciones comunes, integración y entrega | @NachoGarcia15 | [#88](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/88) |
| §5, §6.1, §6.7, §6.8, §6.9, §7.1–§7.5 | Arquitectura, paginación, trazabilidad, resiliencia, datos y seguridad | @JavierSantiburcio | [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83) |
| §4, §6.10, §7.7, §10 | Requisitos de calidad, SLOs, observabilidad y verificación | @MarioMerZap | [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83) |
| §6.2, §6.4 | Dashboard operativo (F1) e incidencias normalizadas (F3) | @NachoGarcia15 | [#86](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/86) |
| §6.3 | Imágenes en un servicio externo (F2) | @MarioMerZap | [#86](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/86) |
| §6.5, §7.6 | Microservicio de contexto externo (F4), privacidad y aspectos legales | @IvanPDcode, @GregorioMerchan | [#84](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/84) |
| §6.6 | Microservicio de auditoría y rol AUDITOR (F5) | @IvanPDcode, @GregorioMerchan | [#85](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/85) |

## 1. Resumen ejecutivo ★

**Objetivo (una frase):** [Qué se consigue y para quién, en lenguaje claro].

[En 4–6 líneas: problema, solución propuesta, razón principal y principal riesgo. Se escribe al final, cuando estén redactadas las áreas de §6.]

## 2. Contexto y problema ★

### 2.1. Situación actual

[Resumen de la arquitectura actual en 3–5 líneas: monolito modular con Spring Boot 2.6, React + Vite y PostgreSQL 16, desplegado con Docker Compose. La situación concreta de cada área está al principio de cada apartado de §6.]

- **Problema:** [Consecuencia observable para los usuarios, la operación o el equipo].

### 2.2. Motivación: enunciado de la iteración 2

Funcionalidades:

- **F1.** «Dashboard para los operadores municipales y técnicos con una mapa que incluya, al menos, las incidencias, indicadores generales con datos y posibilidades de filtrado de incidencias.»
- **F2.** «Servicio externo para subir las imágenes de las incidencias (por ejemplo, cloudinary).»
- **F3.** «Unificación en una única incidencia normalizada de los reportes de incidencias procedentes de diferentes ciudadanos. Trazabilidad de los reportes con la incidencia normalizada.»
- **F4.** «Microservicio de extracción, normalización y gestión de datos externos para dar contexto a las incidencias. Deben seleccionarse qué datos del open data se van a emplear y añadir además la información meteorológica a partir de la AEMET. Este microservicio debe tener su propia base de datos independiente. La extracción de la información deberá actualizarse también cada cierto tiempo.»
- **F5.** «Microservicio de auditoría, con base de datos también independiente, que recoja la información sobre todos los estados por los que pasa una incidencia, los cambios realizados, qué usuario los realizó, etc. Deberá incluir un dashboard que permita el análisis de esta información. Implica también la creación de un nuevo rol de usuario en el sistema, los auditores, que tendrá, junto con los administradores, acceso a esta información.»

Requisitos adicionales:

- **RA1.** «Todos los servicios REST de lectura masiva deben tener paginación.»
- **RA2.** «La incidencia tendrá un UUID que permita su trazabilidad entre los diferentes microservicios.»
- **RA3.** «Deberán diseñarse estrategias de fiabilidad y resiliencia de la aplicación, por ejemplo, qué pasa si alguno de los componentes (servicios externos, microservicios, etc.) no están disponibles durante la ejecución de la aplicación.»
- **RA4.** «Entorno de observabilidad de la aplicación que combine, k6, micrometer, logs estructurados, prometheus, grafana, etc. para poder evaluar los atributos de calidad.»

Y, sobre el proceso: «Las propuestas de diseño de estas soluciones deben plasmarse en un documento de diseño y deben ser validadas por el cliente.»

### 2.3. Documentos relacionados

- Arquitectura implementada: [`docs/architecture.md`](../architecture.md) y [C4 niveles 1–3](../diagrama-C4/).
- Contrato REST vigente: [`docs/api/acuerdo-api.md`](../api/acuerdo-api.md).
- Decisiones vigentes: [ADR-01 a ADR-14](../adr/). Los afectados por este diseño se listan en §5.1.
- Rendimiento medido: [`docs/resultados-k6.md`](../resultados-k6.md).

## 3. Objetivos, no objetivos y alcance ★

| Código | Área | Sección | Responsables |
|---|---|---|---|
| ARQ | Paso de monolito modular a monolito + microservicios | §6.1 | @JavierSantiburcio |
| F1 | Dashboard para operadores municipales y técnicos | §6.2 | @NachoGarcia15 |
| F2 | Servicio externo para las imágenes (p. ej. Cloudinary) | §6.3 | @MarioMerZap |
| F3 | Unificación de reportes en una incidencia normalizada y trazabilidad | §6.4 | @NachoGarcia15 |
| F4 | Microservicio de contexto externo (Open Data + AEMET) | §6.5 | @IvanPDcode, @GregorioMerchan |
| F5 | Microservicio de auditoría, rol AUDITOR y dashboard | §6.6 | @IvanPDcode, @GregorioMerchan |
| RA1 | Paginación de los servicios REST de lectura masiva | §6.7 | @JavierSantiburcio |
| RA2 | UUID de la incidencia para la trazabilidad entre microservicios | §6.8 | @JavierSantiburcio |
| RA3 | Estrategias de fiabilidad y resiliencia | §6.9 | @JavierSantiburcio |
| RA4 | Entorno de observabilidad | §6.10 | @MarioMerZap |

**Objetivos** (resultados, no detalles de implementación)
- O1. [Resultado funcional o técnico verificable].

**No objetivos**
- N1. [Lo que expresamente NO se abordará].

**Dentro del alcance:** [Servicios, contratos y datos afectados].
**Fuera del alcance:** [Servicios o migraciones excluidas].

### 3.1. Escenarios de uso

1. [Actor] [acción paso a paso] → [resultado observable].

## 4. Requisitos y drivers arquitectónicos

| ID | Tipo | Necesidad / escenario | Criterio de aceptación y evidencia | Prioridad |
|---|---|---|---|---|
| RF-... | Funcional | [Comportamiento] | [Prueba observable] | [Alta/Media/Baja] |
| RQ-... | Calidad | [Carga/fallo/condición] | [Métrica + umbral + herramienta] | [...] |
| RC-... | Restricción | [Tecnología, plazo, presupuesto, cumplimiento] | [Cómo se comprueba] | [...] |

> Para los requisitos de calidad, describe escenario + condiciones + métrica + umbral + método de validación. Los umbrales deben salir del enunciado, de una negociación o de una medición (por ejemplo, [`docs/resultados-k6.md`](../resultados-k6.md)); no los inventes como si fueran hechos.

### 4.1. Objetivos de nivel de servicio (SLOs)

| Dimensión | Indicador | Umbral | Origen del umbral |
|---|---|---|---|
| [Latencia / disponibilidad / ...] | [p. ej. p95 de `http.server.requests`] | [...] | [Enunciado / negociación / medición] |

## 5. Arquitectura actual y dependencias

- **C4 Contexto/Contenedores:** [Enlace al diagrama vigente en `docs/diagrama-C4/`].
- **Flujo actual:** [Resumen].
- **Dependencias y restricciones:** [Servicios internos y externos, lenguajes, librerías y persistencia difíciles de reemplazar].

### 5.1. ADRs existentes afectados

> Previsión inicial. Se confirma en la fase C, después de la validación con el cliente. La columna *Áreas* indica qué apartados de §6 deben ponerse de acuerdo.

| ADR | Qué cambia con este diseño | Previsión | Áreas | Motivo |
|---|---|---|---|---|
| ADR-01 | Nuevas vistas en la SPA (dashboard operativo y de auditoría) | Sigue vigente | F1, F5 | [Completar] |
| ADR-02 | Monolito modular → monolito + microservicios | Sustituida por el ADR de `D-ARQ` | ARQ | [Completar] |
| ADR-03 | PostgreSQL con `ddl-auto` → ¿BD por servicio y migraciones versionadas? | A decidir | ARQ, F4, F5 | [Completar] |
| ADR-04 | Degradación con try-catch → patrones de resiliencia; el contexto externo pasa al microservicio | Sustituida por el ADR de `D-RA3` | RA3, F4 | [Completar] |
| ADR-05 | Máquina de estados: `StatusChange` frente a eventos de auditoría, reconciliar transiciones, fusionar y separar | A decidir | F3, F5 | [Completar] |
| ADR-06 | `ApiError` y `X-Request-ID` solo en errores; su texto no coincide con el `ApiError` actual | Sustituida por el ADR de `D-RA2` | RA2 | [Completar] |
| ADR-07 | Adjuntos en disco → proveedor externo de imágenes | Sustituida por el ADR de `D-F2` | F2 | [Completar] |
| ADR-08 | Paginación solo en `GET /api/incidents`; carga del mapa del dashboard | Sustituida por el ADR de `D-RA1` | RA1, F1 | [Completar] |
| ADR-10 | UUID como clave entre servicios y en los eventos | Sigue vigente (los ADR nuevos lo citan) | RA2, F5 | [Completar] |
| ADR-11 | Duplicados preventivos → agrupación de reportes; Haversine para activos cercanos | Vigente y ampliada por `D-F3`; vigente si el cálculo de activos se queda en el monolito | F3, F4 | [Completar] |
| ADR-12 | Autenticación entre servicios; rol AUDITOR (6 roles) | A decidir | ARQ, F5 | [Completar] |
| ADR-13 | Observabilidad restringida al perfil `k6` | Sustituida por el ADR de `D-RA4` | RA4 | [Completar] |
| ADR-14 | Aislamiento de los tests replicado en cada microservicio | Sigue vigente | ARQ | [Completar] |

## 6. Decisiones y diseño por área ★

> **Cómo se rellena cada área.** Cada apartado empieza con su situación actual (ya verificada en el repositorio) y sigue con:
> 1. ★ **Cambios que proponemos:** 3–5 líneas con lo que cambia y por qué. Es lo primero que leerá el profesor en la v0.1.
> 2. **Decisiones** de alto coste de error, numeradas por área. ★ En la v0.1 basta con *Contexto*, al menos dos *Alternativas* y la *Propuesta*. *Criterios*, *Evidencia* y *Consecuencias* pueden completarse después. El estado lo cambia la validación con el cliente.
> 3. **Cambios en la API y en los datos** de esa área (se trasladan a `acuerdo-api.md` cuando se implementen).
> 4. ★ **Cuestiones abiertas para el cliente:** lo que necesitamos que decida o confirme. Se consolidan en §11.
>
> Si una decisión depende de otra área, cítala por su identificador (`ver D-ARQ-01`) en vez de repetirla.

### 6.1. Arquitectura y comunicación entre servicios (ARQ)

> **Responsable:** @JavierSantiburcio · **Issue:** [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83) · **Desbloquea:** las interfaces de F4 (§6.5) y F5 (§6.6). Conviene cerrar primero `D-ARQ-01` y `D-ARQ-02`.

**Situación actual:**
- Monolito modular con Spring Boot 2.6, React + Vite y PostgreSQL 16 (ADR-02, ADR-03). El C4 de `docs/diagrama-C4/` (L1–L3) describe el monolito.
- `docker-compose.yml` levanta `postgres`, y `prometheus` y `grafana` con el perfil `observability`.
- Sesión con cookie `HttpOnly`, CSRF y RBAC con 5 roles (ADR-12). No existe autenticación entre servicios.

**★ Cambios que proponemos:** [...]

#### D-ARQ-01: Estilo de comunicación entre servicios (REST síncrono, mensajería o mixto)

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-ARQ-02: Autenticación entre servicios y de los usuarios frente a los microservicios

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-ARQ-03: Acceso del frontend a los servicios (API Gateway sí o no)

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-ARQ-04: Base de datos por servicio y gestión del esquema

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-ARQ-05: Despliegue local, configuración externa y descubrimiento de servicios

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### Cambios en la API y en los datos (ARQ)

> Si el área no cambia contratos ni datos, escribe «Sin cambios».

| Método y ruta / evento / entidad | Cambio | DTOs o campos | Permisos (roles) | ¿Compatible? |
|---|---|---|---|---|
| [...] | Nuevo / Modificado / Eliminado | [...] | [...] | Sí / No |

#### ★ Cuestiones abiertas para el cliente (ARQ)

- **Q-ARQ-1:** [Pregunta concreta que debe decidir o confirmar el cliente].

### 6.2. Dashboard para operadores municipales y técnicos (F1)

> **Responsable:** @NachoGarcia15 · **Issue:** [#86](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/86) · **Coordina con:** RA1 (§6.7) para la carga del mapa. **Extensión:** una página.

**Situación actual:**
- `ExplorePage` tiene panel superior, filtros `status`, `category` y `q`, y el mapa en `MapSurface` con `IncidentMarkersLayer`.
- `GET /api/incidents/map` usa bbox y `limit` ≤ 5000, y no figura en `acuerdo-api.md`.
- `AnalyticsPage` y `GET /api/analytics/summary` (`OPERATOR`, `ADMIN`, `ANALYST`) dan totales por estado, categoría y distrito, y conteos de 7 y 30 días.
- No existe el filtro «asignadas a mí». `Incident` no tiene campo de prioridad y el distrito sale de `UrbanContext`.

**★ Cambios que proponemos:** [...]

#### D-F1-01: Alcance del dashboard frente a Explorar y Analítica, y vista por rol

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F1-02: Indicadores y endpoint de agregados

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F1-03: Carga de muchas incidencias en el mapa (bbox, clustering)

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### Cambios en la API y en los datos (F1)

> Si el área no cambia contratos ni datos, escribe «Sin cambios».

| Método y ruta / evento / entidad | Cambio | DTOs o campos | Permisos (roles) | ¿Compatible? |
|---|---|---|---|---|
| [...] | Nuevo / Modificado / Eliminado | [...] | [...] | Sí / No |

#### ★ Cuestiones abiertas para el cliente (F1)

- **Q-F1-1:** [Pregunta concreta que debe decidir o confirmar el cliente].

### 6.3. Imágenes en un servicio externo (F2)

> **Responsable:** @MarioMerZap · **Issue:** [#86](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/86) · **Coordina con:** RA3 (§6.9) para la caída del proveedor y §7.6 para la privacidad de las imágenes. **Extensión:** una página.

**Situación actual:**
- `Attachment` tiene `id`, `incident`, `uploader`, `filename`, `contentType`, `size`, `storageLocation` y `createdAt`.
- `AttachmentService` guarda los ficheros en disco (`uploads/attachments`, `ATTACHMENTS_DIRECTORY`). Admite JPG, PNG, WEBP y PDF, hasta 10 MB y 4 por incidencia (ADR-07).
- Endpoints `POST`, `GET` (lista) y `GET` (descarga) en `/api/incidents/{id}/attachments`. La galería está en `Gallery.jsx`.

**★ Cambios que proponemos:** [...]

#### D-F2-01: Proveedor externo de imágenes

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F2-02: Flujo de subida, validación, miniaturas y borrado (incluidos los PDF)

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F2-03: Migración de los adjuntos actuales y comportamiento ante fallos del proveedor

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### Cambios en la API y en los datos (F2)

> Si el área no cambia contratos ni datos, escribe «Sin cambios».

| Método y ruta / evento / entidad | Cambio | DTOs o campos | Permisos (roles) | ¿Compatible? |
|---|---|---|---|---|
| [...] | Nuevo / Modificado / Eliminado | [...] | [...] | Sí / No |

#### ★ Cuestiones abiertas para el cliente (F2)

- **Q-F2-1:** [Pregunta concreta que debe decidir o confirmar el cliente].

### 6.4. Unificación de reportes en una incidencia normalizada (F3)

> **Responsable:** @NachoGarcia15 · **Issue:** [#86](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/86) · **Coordina con:** F5 (§6.6) para el catálogo de eventos y `StatusChange`, y RA1 (§6.7) para paginar la trazabilidad. Es el área que más cambia el modelo de dominio.

**Situación actual:**
- `Incident` es una entidad plana (`id`, `title`, `description`, `category`, `latitude`, `longitude`, `status`, `createdAt`), sin reportes asociados ni relación entre incidencias.
- Solo existe la detección **preventiva** de duplicados: `GET /api/incidents/duplicates` con bbox + Haversine, 50 m y estados activos (ADR-11). `ReportPage` consulta con 60 m y el ciudadano decide.
- No hay fusión ni separación de incidencias, ni vista de «mis reportes».
- `acuerdo-api.md` e `ia-contexto.md` describen transiciones de estado distintas.

**★ Cambios que proponemos:** [...]

#### D-F3-01: Modelo reporte ciudadano – incidencia normalizada (N:1)

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F3-02: Criterio y modo de agrupación de reportes (automático o confirmado por un operador)

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F3-03: Reportes sobre incidencias resueltas o cerradas; fusionar y separar incidencias

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F3-04: Trazabilidad, notificaciones y eventos de auditoría

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F3-05: Migración de las incidencias existentes

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### Cambios en la API y en los datos (F3)

> Si el área no cambia contratos ni datos, escribe «Sin cambios».

| Método y ruta / evento / entidad | Cambio | DTOs o campos | Permisos (roles) | ¿Compatible? |
|---|---|---|---|---|
| [...] | Nuevo / Modificado / Eliminado | [...] | [...] | Sí / No |

#### ★ Cuestiones abiertas para el cliente (F3)

- **Q-F3-1:** [Pregunta concreta que debe decidir o confirmar el cliente].

### 6.5. Microservicio de contexto externo: Open Data y AEMET (F4)

> **Responsables:** @IvanPDcode, @GregorioMerchan · **Issue:** [#84](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/84) · **Depende de:** `D-ARQ-01`, `D-ARQ-02` y `D-ARQ-04` (§6.1) para interfaces y BD. **Coordina con:** RA1, RA2 y RA3 (§6.7–§6.9).

**Situación actual:**
- Paquete `com.urbanpulse.external`: adaptadores mock `MockGeoLocationAdapter`, `MockTrafficAdapter` y `MockWeatherAdapter`, servicios `ExternalContextService`, `GeoLocationService`, `TrafficService` y `WeatherService`, y degradación controlada con fallback (ADR-04).
- Entidades `UrbanContext`, `UrbanAsset` y `ExternalObservation` en la BD del monolito.
- `GET /api/incidents/{id}/context` devuelve barrio, distrito, clima, tráfico, observaciones y activos en 100 m. El contexto se captura al crear la incidencia.
- GECOR 2026 se lee de un CSV local mediante `OpenDataIncidentService`, se sirve en `GET /api/opendata/incidents` (sin paginar) y se muestra en `HistoricPage`.
- No hay integración con la AEMET.

**★ Cambios que proponemos:** [...]

#### D-F4-01: Datasets de Open Data Málaga seleccionados

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F4-02: Integración con AEMET (datos, municipio o estación, clave de API)

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F4-03: Base de datos propia y modelo normalizado

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F4-04: Planificación de la extracción (scheduler y frecuencia por fuente)

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F4-05: API expuesta al monolito (síncrona con caché o datos precalculados)

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F4-06: Destino de `UrbanContext`, `ExternalObservation`, los adaptadores mock y GECOR

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F4-07: Comportamiento ante fallos de AEMET, Open Data o del propio microservicio

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### Cambios en la API y en los datos (F4)

> Si el área no cambia contratos ni datos, escribe «Sin cambios».

| Método y ruta / evento / entidad | Cambio | DTOs o campos | Permisos (roles) | ¿Compatible? |
|---|---|---|---|---|
| [...] | Nuevo / Modificado / Eliminado | [...] | [...] | Sí / No |

#### ★ Cuestiones abiertas para el cliente (F4)

- **Q-F4-1:** [Pregunta concreta que debe decidir o confirmar el cliente].

### 6.6. Microservicio de auditoría y rol AUDITOR (F5)

> **Responsables:** @IvanPDcode, @GregorioMerchan · **Issue:** [#85](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/85) · **Depende de:** `D-ARQ-01` y `D-ARQ-02` (§6.1) para el envío de eventos y la autenticación. **Coordina con:** F3 (§6.4) para los eventos de fusión y separación, y RA1–RA3 (§6.7–§6.9).

**Situación actual:**
- `StatusChange` (`id`, `incidentId`, `previousStatus`, `newStatus`, `actorId`, `reason`, `changedAt`) está en la BD del monolito (ADR-05). Se consulta con `GET /api/incidents/{id}/status-changes` y se muestra en `Timeline.jsx`.
- Las asignaciones, notas técnicas, adjuntos y cuentas de usuario cambian sin dejar registro histórico.
- Roles en `com.urbanpulse.enums.Role`: `CITIZEN`, `OPERATOR`, `TECHNICIAN`, `ADMIN` y `ANALYST`. Las reglas están en `SecurityConfiguration` y la visibilidad en `AuthContext.jsx`. Solo `ADMIN` crea cuentas municipales (`POST /api/admin/users`, ADR-12).
- La analítica se limita a `GET /api/analytics/summary` y `AnalyticsPage`, sin vistas de auditoría.

**★ Cambios que proponemos:** [...]

#### D-F5-01: Catálogo y esquema de los eventos de auditoría

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F5-02: Envío de eventos sin pérdidas (outbox, mensajería o REST asíncrono)

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F5-03: Base de datos de solo inserción

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F5-04: Relación con `StatusChange`

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F5-05: Rol AUDITOR y autorización en el microservicio

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-F5-06: Dashboard de auditoría (KPIs, vistas y paginación)

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### Cambios en la API y en los datos (F5)

> Si el área no cambia contratos ni datos, escribe «Sin cambios».

| Método y ruta / evento / entidad | Cambio | DTOs o campos | Permisos (roles) | ¿Compatible? |
|---|---|---|---|---|
| [...] | Nuevo / Modificado / Eliminado | [...] | [...] | Sí / No |

#### ★ Cuestiones abiertas para el cliente (F5)

- **Q-F5-1:** [Pregunta concreta que debe decidir o confirmar el cliente].

### 6.7. Paginación de los servicios REST de lectura masiva (RA1)

> **Responsable:** @JavierSantiburcio · **Issue:** [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83) · **Afecta a:** los endpoints de lectura masiva de todas las áreas, incluidos los nuevos de F1, F3, F4 y F5.

**Situación actual:**
- Solo `GET /api/incidents` pagina (`page`, `size` de 1 a 100, `sort`).
- `GET /api/incidents/map` usa bbox y `limit` ≤ 5000.
- Notificaciones, asignaciones, adjuntos y `GET /api/opendata/incidents` devuelven colecciones completas.

**★ Cambios que proponemos:** [...]

#### D-RA1-01: Formato común de paginación y endpoints de lectura masiva afectados

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### Cambios en la API y en los datos (RA1)

> Si el área no cambia contratos ni datos, escribe «Sin cambios».

| Método y ruta / evento / entidad | Cambio | DTOs o campos | Permisos (roles) | ¿Compatible? |
|---|---|---|---|---|
| [...] | Nuevo / Modificado / Eliminado | [...] | [...] | Sí / No |

#### ★ Cuestiones abiertas para el cliente (RA1)

- **Q-RA1-1:** [Pregunta concreta que debe decidir o confirmar el cliente].

### 6.8. UUID y trazabilidad entre servicios (RA2)

> **Responsable:** @JavierSantiburcio · **Issue:** [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83) · **Afecta a:** F4 y F5 (claves entre servicios y `correlationId` en los eventos).

**Situación actual:**
- Todas las entidades usan UUID (ADR-10).
- `X-Request-ID` solo se genera en los errores (`GlobalExceptionHandler` y `SecurityConfiguration`). No hay filtro para las respuestas 2xx ni correlación en los logs.

**★ Cambios que proponemos:** [...]

#### D-RA2-01: UUID de la incidencia como clave entre servicios

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-RA2-02: Propagación del correlationId (`X-Request-ID`) en respuestas y logs (MDC)

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### Cambios en la API y en los datos (RA2)

> Si el área no cambia contratos ni datos, escribe «Sin cambios».

| Método y ruta / evento / entidad | Cambio | DTOs o campos | Permisos (roles) | ¿Compatible? |
|---|---|---|---|---|
| [...] | Nuevo / Modificado / Eliminado | [...] | [...] | Sí / No |

#### ★ Cuestiones abiertas para el cliente (RA2)

- **Q-RA2-1:** [Pregunta concreta que debe decidir o confirmar el cliente].

### 6.9. Fiabilidad y resiliencia (RA3)

> **Responsable:** @JavierSantiburcio · **Issue:** [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83) · **Afecta a:** F2 (proveedor de imágenes), F4 (AEMET, Open Data) y F5 (microservicio de auditoría). La matriz de fallos está en §7.4.

**Situación actual:**
- Los adaptadores mock aíslan los fallos con try-catch y fallback (ADR-04).
- No hay timeouts configurados, reintentos ni circuit breaker.

**★ Cambios que proponemos:** [...]

#### D-RA3-01: Matriz de fallos y patrones de resiliencia (timeouts, reintentos, circuit breaker, bulkhead, outbox)

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-RA3-02: Health checks, readiness y degradación visible en la UI

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### Cambios en la API y en los datos (RA3)

> Si el área no cambia contratos ni datos, escribe «Sin cambios».

| Método y ruta / evento / entidad | Cambio | DTOs o campos | Permisos (roles) | ¿Compatible? |
|---|---|---|---|---|
| [...] | Nuevo / Modificado / Eliminado | [...] | [...] | Sí / No |

#### ★ Cuestiones abiertas para el cliente (RA3)

- **Q-RA3-1:** [Pregunta concreta que debe decidir o confirmar el cliente].

### 6.10. Observabilidad (RA4)

> **Responsable:** @MarioMerZap · **Issue:** [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83) · **Afecta a:** todos los servicios (métricas y logs). Los SLOs están en §4.1 y la verificación en §10.

**Situación actual:**
- Actuator + Micrometer Prometheus; las métricas solo se exponen con el perfil `k6` (ADR-13). Hay informe en `docs/resultados-k6.md`.
- Los logs no son estructurados.

**★ Cambios que proponemos:** [...]

#### D-RA4-01: Pila de observabilidad (métricas, logs estructurados, Prometheus y Grafana)

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### D-RA4-02: Atributos de calidad, SLOs y escenarios k6

- ★ **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- ★ **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta`

#### Cambios en la API y en los datos (RA4)

> Si el área no cambia contratos ni datos, escribe «Sin cambios».

| Método y ruta / evento / entidad | Cambio | DTOs o campos | Permisos (roles) | ¿Compatible? |
|---|---|---|---|---|
| [...] | Nuevo / Modificado / Eliminado | [...] | [...] | Sí / No |

#### ★ Cuestiones abiertas para el cliente (RA4)

- **Q-RA4-1:** [Pregunta concreta que debe decidir o confirmar el cliente].

## 7. Diseño propuesto: visión de conjunto

> Esta sección une las áreas de §6. Los cambios de API y datos de cada área están en su apartado de §6; aquí solo va lo que afecta a varios servicios a la vez.

### 7.1. Visión y diagramas C4 ★

- **Contexto (L1):** [Enlace o «sin cambios»].
- **Contenedores (L2):** [Enlace y diferencias: monolito, microservicio de contexto externo, microservicio de auditoría, sus BD y los servicios externos]. ★ Para la v0.1 basta con este diagrama.
- **Componentes (L3):** [Solo si ayuda].
- **Secuencias / flujo de eventos / wireframes:** [Enlace o descripción]. Guarda los diagramas en formato editable (`.drawio`) junto a su `.png` en `docs/design-docs/img/`.

### 7.2. Interfaces entre servicios

[Cómo se comunican el frontend, el monolito y los microservicios (según `D-ARQ-01` a `D-ARQ-03`): llamadas síncronas, eventos, versiones, errores, idempotencia y compatibilidad. Referencia OpenAPI/AsyncAPI cuando proceda.]

### 7.3. Datos: titularidad por servicio

| Servicio | Base de datos | Datos de los que es dueño | Cómo referencia datos de otros servicios |
|---|---|---|---|
| Monolito | [...] | [...] | [...] |
| Microservicio de contexto externo | [...] | [...] | [UUID de la incidencia (`D-RA2-01`)] |
| Microservicio de auditoría | [...] | [...] | [UUID de la incidencia (`D-RA2-01`)] |

### 7.4. Fallos, concurrencia y resiliencia: matriz de fallos

| Componente que falla | Comportamiento esperado | Qué ve el usuario | Patrón (`D-RA3-01`) | Cómo se prueba | Área |
|---|---|---|---|---|---|
| Proveedor de imágenes (Cloudinary) | [...] | [...] | [...] | [...] | F2 |
| AEMET | [...] | [...] | [...] | [...] | F4 |
| Open Data Málaga | [...] | [...] | [...] | [...] | F4 |
| Microservicio de contexto externo | [...] | [...] | [...] | [...] | F4 |
| Microservicio de auditoría | [...] | [...] | [...] | [...] | F5 |
| Base de datos de un servicio | [...] | [...] | [...] | [...] | ARQ |

### 7.5. Seguridad

[Identidad, autorización (incluido el rol AUDITOR), secretos (claves de AEMET y del proveedor de imágenes por variables de entorno), amenazas, fronteras de confianza y datos sensibles.]

### 7.6. Privacidad y consideraciones legales

- **Open Data Málaga y AEMET (F4):** [Licencia CC BY 4.0 y atribución; condiciones de uso de AEMET OpenData].

- **Auditoría (F5):** [Datos personales del actor, retención y quién puede consultarlos].

- **Imágenes (F2):** [Imágenes con personas o matrículas y condiciones del proveedor. Lo aporta @MarioMerZap].

### 7.7. Operación, observabilidad y despliegue

[Topología, contenedores, configuración externa, métricas, logs estructurados (eventos que se registran), alertas, escalado, reversión y costes. Coherente con `D-RA4-01` y `D-ARQ-05`.]

## 8. Registro de decisiones y trade-offs

> Lo consolida el coordinador a partir de §6 cuando estén fusionadas las áreas. El estado lo actualiza la validación con el cliente.

| ID | Sección | Decisión | Beneficio | Coste / consecuencia | Estado | ¿Requiere ADR? |
|---|---|---|---|---|---|---|
| D-ARQ-01 | §6.1 | Estilo de comunicación entre servicios (REST síncrono, mensajería o mixto) | [...] | [...] | Propuesta | Sí / No |
| D-ARQ-02 | §6.1 | Autenticación entre servicios y de los usuarios frente a los microservicios | [...] | [...] | Propuesta | Sí / No |
| D-ARQ-03 | §6.1 | Acceso del frontend a los servicios (API Gateway sí o no) | [...] | [...] | Propuesta | Sí / No |
| D-ARQ-04 | §6.1 | Base de datos por servicio y gestión del esquema | [...] | [...] | Propuesta | Sí / No |
| D-ARQ-05 | §6.1 | Despliegue local, configuración externa y descubrimiento de servicios | [...] | [...] | Propuesta | Sí / No |
| D-F1-01 | §6.2 | Alcance del dashboard frente a Explorar y Analítica, y vista por rol | [...] | [...] | Propuesta | Sí / No |
| D-F1-02 | §6.2 | Indicadores y endpoint de agregados | [...] | [...] | Propuesta | Sí / No |
| D-F1-03 | §6.2 | Carga de muchas incidencias en el mapa (bbox, clustering) | [...] | [...] | Propuesta | Sí / No |
| D-F2-01 | §6.3 | Proveedor externo de imágenes | [...] | [...] | Propuesta | Sí / No |
| D-F2-02 | §6.3 | Flujo de subida, validación, miniaturas y borrado (incluidos los PDF) | [...] | [...] | Propuesta | Sí / No |
| D-F2-03 | §6.3 | Migración de los adjuntos actuales y comportamiento ante fallos del proveedor | [...] | [...] | Propuesta | Sí / No |
| D-F3-01 | §6.4 | Modelo reporte ciudadano – incidencia normalizada (N:1) | [...] | [...] | Propuesta | Sí / No |
| D-F3-02 | §6.4 | Criterio y modo de agrupación de reportes (automático o confirmado por un operador) | [...] | [...] | Propuesta | Sí / No |
| D-F3-03 | §6.4 | Reportes sobre incidencias resueltas o cerradas; fusionar y separar incidencias | [...] | [...] | Propuesta | Sí / No |
| D-F3-04 | §6.4 | Trazabilidad, notificaciones y eventos de auditoría | [...] | [...] | Propuesta | Sí / No |
| D-F3-05 | §6.4 | Migración de las incidencias existentes | [...] | [...] | Propuesta | Sí / No |
| D-F4-01 | §6.5 | Datasets de Open Data Málaga seleccionados | [...] | [...] | Propuesta | Sí / No |
| D-F4-02 | §6.5 | Integración con AEMET (datos, municipio o estación, clave de API) | [...] | [...] | Propuesta | Sí / No |
| D-F4-03 | §6.5 | Base de datos propia y modelo normalizado | [...] | [...] | Propuesta | Sí / No |
| D-F4-04 | §6.5 | Planificación de la extracción (scheduler y frecuencia por fuente) | [...] | [...] | Propuesta | Sí / No |
| D-F4-05 | §6.5 | API expuesta al monolito (síncrona con caché o datos precalculados) | [...] | [...] | Propuesta | Sí / No |
| D-F4-06 | §6.5 | Destino de `UrbanContext`, `ExternalObservation`, los adaptadores mock y GECOR | [...] | [...] | Propuesta | Sí / No |
| D-F4-07 | §6.5 | Comportamiento ante fallos de AEMET, Open Data o del propio microservicio | [...] | [...] | Propuesta | Sí / No |
| D-F5-01 | §6.6 | Catálogo y esquema de los eventos de auditoría | [...] | [...] | Propuesta | Sí / No |
| D-F5-02 | §6.6 | Envío de eventos sin pérdidas (outbox, mensajería o REST asíncrono) | [...] | [...] | Propuesta | Sí / No |
| D-F5-03 | §6.6 | Base de datos de solo inserción | [...] | [...] | Propuesta | Sí / No |
| D-F5-04 | §6.6 | Relación con `StatusChange` | [...] | [...] | Propuesta | Sí / No |
| D-F5-05 | §6.6 | Rol AUDITOR y autorización en el microservicio | [...] | [...] | Propuesta | Sí / No |
| D-F5-06 | §6.6 | Dashboard de auditoría (KPIs, vistas y paginación) | [...] | [...] | Propuesta | Sí / No |
| D-RA1-01 | §6.7 | Formato común de paginación y endpoints de lectura masiva afectados | [...] | [...] | Propuesta | Sí / No |
| D-RA2-01 | §6.8 | UUID de la incidencia como clave entre servicios | [...] | [...] | Propuesta | Sí / No |
| D-RA2-02 | §6.8 | Propagación del correlationId (`X-Request-ID`) en respuestas y logs (MDC) | [...] | [...] | Propuesta | Sí / No |
| D-RA3-01 | §6.9 | Matriz de fallos y patrones de resiliencia (timeouts, reintentos, circuit breaker, bulkhead, outbox) | [...] | [...] | Propuesta | Sí / No |
| D-RA3-02 | §6.9 | Health checks, readiness y degradación visible en la UI | [...] | [...] | Propuesta | Sí / No |
| D-RA4-01 | §6.10 | Pila de observabilidad (métricas, logs estructurados, Prometheus y Grafana) | [...] | [...] | Propuesta | Sí / No |
| D-RA4-02 | §6.10 | Atributos de calidad, SLOs y escenarios k6 | [...] | [...] | Propuesta | Sí / No |

### 8.1. Decisiones arquitectónicas derivadas

> Se completa tras la validación: un enlace por cada ADR creado a partir de una decisión `Aceptada` o `Modificada por el cliente`. Cada ADR enlaza de vuelta a este documento y a su `D-xx`.

| Decisión | ADR |
|---|---|
| _Se completa tras la validación_ | |

## 9. Plan de implementación, hitos y migración

> Un hito por área como mínimo, en el orden que imponen las dependencias (primero `D-ARQ`).

1. **Hito 1:** [Cambio incremental y entrega demostrable].
2. **Hito 2:** [Pruebas y cambio de contrato].
3. **Hito 3:** [Despliegue controlado o transición si procede].
4. **Hito 4:** [Plan de reversión y limpieza].

**Dependencias:** [...]. **Impacto en versiones anteriores:** [...].

## 10. Estrategia de verificación y evaluación

| Requisito | Prueba / experimento | Entorno y datos | Métrica / umbral | Evidencia esperada |
|---|---|---|---|---|
| RQ-... | [k6, integración, fallo inyectado...] | [...] | [...] | [Informe, trazas, logs, test en CI] |

Explica qué solo puede validarse en un cloud real frente a lo que se valida en local o simulado.

## 11. Riesgos, hipótesis y problemas abiertos ★

> Consolida las *Cuestiones abiertas para el cliente* de cada área de §6 (manteniendo su identificador `Q-<área>-N`) y añade los riesgos y las hipótesis globales.

| ID | Tipo | Descripción | Impacto | Acción y responsable |
|---|---|---|---|---|
| H-1 | Hipótesis | [...] | [...] | [Experimento] |
| R-1 | Riesgo | [...] | [...] | [Mitigación] |
| Q-... | Pregunta al cliente | [...] | [...] | [Decisión pendiente] |

### 11.1. Problemas resueltos

| ID | Decisión final | Fecha | Dónde se discutió |
|---|---|---|---|
| Q-... | [...] | [...] | [Issue, PR, acta] |

## 12. Revisión y resultado

- **Versiones entregadas:** v0.1 (preliminar) — [fecha de entrega en el CV].
- **Comentarios de revisión:** [Enlaces o resumen de las objeciones relevantes].
- **Resolución:** [Aceptado / pendiente / descartado].
- **Decisiones registradas:** [ADR, ver §8.1].
- **Diferencias observadas tras implementar:** [Qué cambió respecto al diseño, por qué y dónde se documentó].

## 13. Glosario

| Término | Definición |
|---|---|
| Incidencia normalizada | [...] |
| Reporte ciudadano | [...] |
| [...] | [...] |

## Checklist de aprobación

- [ ] Problema y alcance delimitados.
- [ ] Drivers y restricciones documentados, sin atribuir al enunciado requisitos inexistentes.
- [ ] Al menos dos alternativas comparadas por decisión, o justificación de por qué no hay alternativas viables.
- [ ] Diagramas, datos y contratos coherentes entre áreas.
- [ ] Fallos, seguridad, operación y costes considerados en proporción al cambio.
- [ ] Criterios de aceptación verificables y plan de pruebas reproducible.
- [ ] Riesgos y cuestiones abiertas explícitos.
- [ ] ADRs existentes afectados identificados (§5.1) y cambios a `acuerdo-api.md` y al C4 descritos (§6 y §7).
- [ ] Revisión técnica realizada; ADRs enlazados en §8.1 cuando corresponda.
