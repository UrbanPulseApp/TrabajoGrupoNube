# Documento de diseño de UrbanPulse: iteración 2

> Cada responsable edita solo sus secciones (ver la tabla de responsables). Sustituye los campos entre corchetes y borra las indicaciones que no necesites. Para la primera versión basta con explicar los cambios que se van a realizar: secciones 1 a 3 y, en cada área de la sección 6, la situación actual, los cambios propuestos y la propuesta de cada decisión. Incluye solo decisiones difíciles de revertir (modelo de datos, comunicación entre servicios, almacenamiento, seguridad); los detalles de interfaz no van aquí. Mantén las alternativas aunque la solución parezca sencilla.

| Metadato | Valor |
|---|---|
| Estado | Borrador |
| Versión | 0.1 |
| Autoría | Equipo UrbanPulse (ver responsables por sección) |
| Fecha de creación / última revisión | 2026-11-26 / 2026-11-26 |
| Iteración | 2: evolución a monolito más microservicios |
| Revisores | [Personas o roles] |
| Aprobación del cliente | Pendiente (ver [acta](validacion-cliente.md)) |
| Enlaces | Épica [#80](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/80), [C4](../diagrama-C4/), [acuerdo-api](../api/acuerdo-api.md), [ADRs](../adr/) |

## Responsables por sección

| Sección | Contenido | Responsables | Issue |
|---|---|---|---|
| 1, 2, 3, 11, 12 y 13 | Partes comunes e integración del documento | @NachoGarcia15 | [#80](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/80) |
| 5, 6.1, 6.7, 6.8, 6.9 y 7.1 a 7.5 | Arquitectura, paginación, trazabilidad y resiliencia | @JavierSantiburcio | [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83) |
| 4, 6.10, 7.7 y 10 | Requisitos de calidad, observabilidad y verificación | @MarioMerZap | [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83) |
| 6.2 y 6.4 | Dashboard y unificación de reportes | @NachoGarcia15 | [#86](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/86) |
| 6.3 | Imágenes en un servicio externo | @MarioMerZap | [#86](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/86) |
| 6.5 | Microservicio de contexto externo | @IvanPDcode, @GregorioMerchan | [#84](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/84) |
| 6.6 | Microservicio de auditoría | @IvanPDcode, @GregorioMerchan | [#85](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/85) |
| 7.6, 8 y 9 | Privacidad, registro de decisiones y plan | Cada responsable añade lo de su área | |

## 1. Resumen ejecutivo

**Objetivo (una frase):** [Qué se consigue y para quién].

[En 4 a 6 líneas: problema, solución propuesta, razón principal y principal riesgo].

## 2. Contexto y problema

- **Situación actual:** [Arquitectura y comportamiento actuales, con sus fuentes].
- **Problema:** [Consecuencia observable para los usuarios, la operación o el equipo].
- **Motivación:** [Por qué ahora; enunciado de la iteración 2].
- **Documentos relacionados:** [ADRs, informe de k6, issues].

## 3. Objetivos, no objetivos y alcance

**Objetivos**
- O1. [Resultado verificable].

**No objetivos**
- N1. [Lo que no se aborda en esta iteración].

**Dentro del alcance:** [Servicios, contratos y datos afectados].
**Fuera del alcance:** [Lo que queda excluido].

### 3.1. Escenarios de uso

1. [Actor, pasos y resultado observable].

## 4. Requisitos y drivers arquitectónicos

| ID | Tipo | Necesidad o escenario | Criterio de aceptación y evidencia | Prioridad |
|---|---|---|---|---|
| RF-... | Funcional | [...] | [...] | [Alta / Media / Baja] |
| RQ-... | Calidad | [Carga, fallo o condición] | [Métrica, umbral y herramienta] | [...] |
| RC-... | Restricción | [Tecnología, plazo, presupuesto] | [Cómo se comprueba] | [...] |

Los umbrales deben salir del enunciado, de una negociación o de una medición (por ejemplo, [resultados-k6.md](../resultados-k6.md)), no inventarse.

### 4.1. Objetivos de nivel de servicio (SLOs)

| Dimensión | Indicador | Umbral | Origen del umbral |
|---|---|---|---|
| [Latencia / disponibilidad] | [...] | [...] | [Enunciado / negociación / medición] |

## 5. Arquitectura actual y dependencias

- **C4 vigente:** [diagramas C4](../diagrama-C4/) (niveles 1 a 3, monolito).
- **Flujo actual:** [Resumen].
- **Dependencias y restricciones:** [Servicios internos y externos, librerías, persistencia].

### 5.1. ADRs existentes afectados

| ADR | Título | Áreas que pueden afectarlo | Qué cambia | Propuesta |
|---|---|---|---|---|
| ADR-01 | React para el frontend | F1, F5 | [...] | [Sigue vigente / Sustituida / Obsoleta] |
| ADR-02 | Spring Boot, monolito modular | ARQ | [...] | [Sigue vigente / Sustituida / Obsoleta] |
| ADR-03 | PostgreSQL en Docker con JPA | ARQ, F4, F5 | [...] | [Sigue vigente / Sustituida / Obsoleta] |
| ADR-04 | Degradación controlada de fuentes externas | RA3, F2, F4 | [...] | [Sigue vigente / Sustituida / Obsoleta] |
| ADR-05 | Máquina de estados y StatusChange | F3, F5 | [...] | [Sigue vigente / Sustituida / Obsoleta] |
| ADR-06 | Manejador global de excepciones y ApiError | RA2 | [...] | [Sigue vigente / Sustituida / Obsoleta] |
| ADR-07 | Almacenamiento de adjuntos en disco | F2 | [...] | [Sigue vigente / Sustituida / Obsoleta] |
| ADR-08 | Paginación y filtrado para mapas | RA1, F1 | [...] | [Sigue vigente / Sustituida / Obsoleta] |
| ADR-10 | Identificadores UUID contra IDOR | RA2, F5 | [...] | [Sigue vigente / Sustituida / Obsoleta] |
| ADR-11 | Detección preventiva de duplicados | F3, F4 | [...] | [Sigue vigente / Sustituida / Obsoleta] |
| ADR-12 | Autenticación multirol y RBAC | ARQ, F5 | [...] | [Sigue vigente / Sustituida / Obsoleta] |
| ADR-13 | Observabilidad local con el perfil k6 | RA4 | [...] | [Sigue vigente / Sustituida / Obsoleta] |
| ADR-14 | Aislamiento de la base de datos de tests | ARQ | [...] | [Sigue vigente / Sustituida / Obsoleta] |

## 6. Decisiones y diseño por área

Cada decisión se numera con el código de su área. El estado puede ser Propuesta, Aceptada, Rechazada o Modificada por el cliente, y lo actualiza la validación.

### 6.1. Arquitectura y comunicación entre servicios (ARQ)

Responsables: @JavierSantiburcio. Issue: [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83).

Enunciado: "Paso de monolito a monolito más microservicios. Los microservicios de contexto externo y de auditoría deben tener base de datos independiente."

#### Situación actual

[Qué existe hoy en el código: entidades, endpoints, pantallas. La issue recoge el punto de partida].

#### Cambios propuestos

[Resumen de lo que se va a cambiar en esta área].

#### Decisiones

##### D-ARQ-01: Estilo de comunicación entre servicios

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-ARQ-02: Autenticación entre servicios y de los usuarios en los microservicios

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-ARQ-03: Acceso del frontend a los servicios (API Gateway)

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-ARQ-04: Base de datos por servicio y gestión del esquema

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-ARQ-05: Despliegue local, configuración externa y descubrimiento de servicios

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

#### Cambios en la API y en los datos

[Endpoints, DTOs, permisos y entidades nuevas o modificadas].

#### Cuestiones abiertas

- [Pregunta pendiente de decidir o de validar con el cliente].

### 6.2. Dashboard para operadores municipales y técnicos (F1)

Responsables: @NachoGarcia15. Issue: [#86](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/86).

Enunciado: "Dashboard para los operadores municipales y técnicos con un mapa que incluya, al menos, las incidencias, indicadores generales con datos y posibilidades de filtrado de incidencias."

#### Situación actual

[Qué existe hoy en el código: entidades, endpoints, pantallas. La issue recoge el punto de partida].

#### Cambios propuestos

[Resumen de lo que se va a cambiar en esta área].

#### Decisiones

##### D-F1-01: Alcance del dashboard frente a Explorar y Analítica, y vista por rol

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F1-02: Indicadores y endpoint de agregados

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F1-03: Carga de muchas incidencias en el mapa

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

#### Cambios en la API y en los datos

[Endpoints, DTOs, permisos y entidades nuevas o modificadas].

#### Cuestiones abiertas

- [Pregunta pendiente de decidir o de validar con el cliente].

### 6.3. Imágenes en un servicio externo (F2)

Responsables: @MarioMerZap. Issue: [#86](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/86).

Enunciado: "Servicio externo para subir las imágenes de las incidencias (por ejemplo, Cloudinary)."

#### Situación actual

[Qué existe hoy en el código: entidades, endpoints, pantallas. La issue recoge el punto de partida].

#### Cambios propuestos

[Resumen de lo que se va a cambiar en esta área].

#### Decisiones

##### D-F2-01: Proveedor externo de imágenes

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F2-02: Flujo de subida, validación, miniaturas y borrado

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F2-03: Migración de los adjuntos actuales y comportamiento ante fallos del proveedor

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

#### Cambios en la API y en los datos

[Endpoints, DTOs, permisos y entidades nuevas o modificadas].

#### Cuestiones abiertas

- [Pregunta pendiente de decidir o de validar con el cliente].

### 6.4. Unificación de reportes en una incidencia normalizada (F3)

Responsables: @NachoGarcia15. Issue: [#86](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/86).

Enunciado: "Unificación en una única incidencia normalizada de los reportes de incidencias procedentes de diferentes ciudadanos. Trazabilidad de los reportes con la incidencia normalizada."

#### Situación actual

[Qué existe hoy en el código: entidades, endpoints, pantallas. La issue recoge el punto de partida].

#### Cambios propuestos

[Resumen de lo que se va a cambiar en esta área].

#### Decisiones

##### D-F3-01: Modelo de reporte ciudadano frente a incidencia normalizada

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F3-02: Criterio y modo de agrupación de reportes

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F3-03: Reportes sobre incidencias resueltas o cerradas; fusionar y separar incidencias

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F3-04: Trazabilidad, notificaciones y eventos de auditoría

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F3-05: Migración de las incidencias existentes

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

#### Cambios en la API y en los datos

[Endpoints, DTOs, permisos y entidades nuevas o modificadas].

#### Cuestiones abiertas

- [Pregunta pendiente de decidir o de validar con el cliente].

### 6.5. Microservicio de contexto externo: Open Data y AEMET (F4)

Responsables: @IvanPDcode, @GregorioMerchan. Issue: [#84](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/84).

Enunciado: "Microservicio de extracción, normalización y gestión de datos externos para dar contexto a las incidencias. Deben seleccionarse qué datos del open data se van a emplear y añadir además la información meteorológica a partir de la AEMET. Este microservicio debe tener su propia base de datos independiente. La extracción de la información deberá actualizarse también cada cierto tiempo."

#### Situación actual

[Qué existe hoy en el código: entidades, endpoints, pantallas. La issue recoge el punto de partida].

#### Cambios propuestos

[Resumen de lo que se va a cambiar en esta área].

#### Decisiones

##### D-F4-01: Datasets de Open Data Málaga seleccionados

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F4-02: Integración con AEMET

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F4-03: Base de datos propia y modelo normalizado

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F4-04: Planificación de la extracción y frecuencia por fuente

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F4-05: API que el microservicio expone al monolito

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F4-06: Destino de UrbanContext, ExternalObservation, los adaptadores mock y GECOR

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F4-07: Comportamiento ante fallos de las fuentes externas

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

#### Cambios en la API y en los datos

[Endpoints, DTOs, permisos y entidades nuevas o modificadas].

#### Cuestiones abiertas

- [Pregunta pendiente de decidir o de validar con el cliente].

### 6.6. Microservicio de auditoría y rol AUDITOR (F5)

Responsables: @IvanPDcode, @GregorioMerchan. Issue: [#85](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/85).

Enunciado: "Microservicio de auditoría, con base de datos también independiente, que recoja la información sobre todos los estados por los que pasa una incidencia, los cambios realizados, qué usuario los realizó, etc. Deberá incluir un dashboard que permita el análisis de esta información. Implica también la creación de un nuevo rol de usuario en el sistema, los auditores, que tendrá, junto con los administradores, acceso a esta información."

#### Situación actual

[Qué existe hoy en el código: entidades, endpoints, pantallas. La issue recoge el punto de partida].

#### Cambios propuestos

[Resumen de lo que se va a cambiar en esta área].

#### Decisiones

##### D-F5-01: Catálogo y esquema de los eventos de auditoría

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F5-02: Envío de eventos sin pérdidas

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F5-03: Base de datos de solo inserción

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F5-04: Relación con StatusChange

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F5-05: Rol AUDITOR y autorización en el microservicio

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-F5-06: Dashboard de auditoría

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

#### Cambios en la API y en los datos

[Endpoints, DTOs, permisos y entidades nuevas o modificadas].

#### Cuestiones abiertas

- [Pregunta pendiente de decidir o de validar con el cliente].

### 6.7. Paginación de los servicios REST de lectura masiva (RA1)

Responsables: @JavierSantiburcio. Issue: [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83).

Enunciado: "Todos los servicios REST de lectura masiva deben tener paginación."

#### Situación actual

[Qué existe hoy en el código: entidades, endpoints, pantallas. La issue recoge el punto de partida].

#### Cambios propuestos

[Resumen de lo que se va a cambiar en esta área].

#### Decisiones

##### D-RA1-01: Formato común de paginación y endpoints afectados

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

#### Cambios en la API y en los datos

[Endpoints, DTOs, permisos y entidades nuevas o modificadas].

#### Cuestiones abiertas

- [Pregunta pendiente de decidir o de validar con el cliente].

### 6.8. UUID y trazabilidad entre servicios (RA2)

Responsables: @JavierSantiburcio. Issue: [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83).

Enunciado: "La incidencia tendrá un UUID que permita su trazabilidad entre los diferentes microservicios."

#### Situación actual

[Qué existe hoy en el código: entidades, endpoints, pantallas. La issue recoge el punto de partida].

#### Cambios propuestos

[Resumen de lo que se va a cambiar en esta área].

#### Decisiones

##### D-RA2-01: UUID de la incidencia como clave entre servicios

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-RA2-02: Identificador de correlación en respuestas y logs

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

#### Cambios en la API y en los datos

[Endpoints, DTOs, permisos y entidades nuevas o modificadas].

#### Cuestiones abiertas

- [Pregunta pendiente de decidir o de validar con el cliente].

### 6.9. Fiabilidad y resiliencia (RA3)

Responsables: @JavierSantiburcio. Issue: [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83).

Enunciado: "Deberán diseñarse estrategias de fiabilidad y resiliencia de la aplicación, por ejemplo, qué pasa si alguno de los componentes (servicios externos, microservicios, etc.) no están disponibles durante la ejecución de la aplicación."

#### Situación actual

[Qué existe hoy en el código: entidades, endpoints, pantallas. La issue recoge el punto de partida].

#### Cambios propuestos

[Resumen de lo que se va a cambiar en esta área].

#### Decisiones

##### D-RA3-01: Patrones de resiliencia por componente

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-RA3-02: Health checks, readiness y degradación visible en la interfaz

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

#### Cambios en la API y en los datos

[Endpoints, DTOs, permisos y entidades nuevas o modificadas].

#### Cuestiones abiertas

- [Pregunta pendiente de decidir o de validar con el cliente].

### 6.10. Observabilidad (RA4)

Responsables: @MarioMerZap. Issue: [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83).

Enunciado: "Entorno de observabilidad de la aplicación que combine k6, Micrometer, logs estructurados, Prometheus, Grafana, etc. para poder evaluar los atributos de calidad."

#### Situación actual

[Qué existe hoy en el código: entidades, endpoints, pantallas. La issue recoge el punto de partida].

#### Cambios propuestos

[Resumen de lo que se va a cambiar en esta área].

#### Decisiones

##### D-RA4-01: Pila de observabilidad: métricas, logs estructurados y dashboards

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

##### D-RA4-02: Atributos de calidad, SLOs y escenarios k6

- **Contexto:** [Qué hay que decidir y por qué importa].
- **Alternativas:**

| Alternativa | Descripción | Ventajas | Inconvenientes |
|---|---|---|---|
| A | [...] | [...] | [...] |
| B | [...] | [...] | [...] |

- **Propuesta:** [Alternativa elegida y por qué].
- **Consecuencias:** [Qué implica: cambios, riesgos aceptados].
- **Estado:** Propuesta

#### Cambios en la API y en los datos

[Endpoints, DTOs, permisos y entidades nuevas o modificadas].

#### Cuestiones abiertas

- [Pregunta pendiente de decidir o de validar con el cliente].

## 7. Diseño propuesto: visión de conjunto

### 7.1. Diagramas C4

- **Contexto (nivel 1):** [Enlace o "sin cambios"].
- **Contenedores (nivel 2):** [Enlace y diferencias con el actual].
- **Componentes (nivel 3):** [Solo si ayuda].

Guarda los diagramas editables (`.drawio`) junto a su `.png` en `docs/diagrama-C4/`.

### 7.2. Interfaces entre servicios y cambios en acuerdo-api

| Método y ruta o evento | Servicio | Cambio | DTOs | Permisos | ¿Compatible? |
|---|---|---|---|---|---|
| [...] | [...] | [Nuevo / Modificado / Eliminado] | [...] | [...] | [Sí / No] |

### 7.3. Datos: titularidad por servicio

| Servicio | Base de datos | Datos de los que es responsable |
|---|---|---|
| [...] | [...] | [...] |

### 7.4. Matriz de fallos

| Componente | Fallo | Comportamiento esperado | Cómo se prueba |
|---|---|---|---|
| [...] | [...] | [...] | [...] |

### 7.5. Seguridad

[Identidad, autorización, secretos, fronteras de confianza y datos sensibles].

### 7.6. Privacidad y aspectos legales

[Datos personales, retención, licencias de datos y condiciones de uso de proveedores externos].

### 7.7. Operación, observabilidad y despliegue

[Contenedores, configuración externa, métricas, logs estructurados, alertas y despliegue].

## 8. Registro de decisiones

| ID | Decisión | Área | Estado | ¿Requiere ADR? |
|---|---|---|---|---|
| D-ARQ-01 | Estilo de comunicación entre servicios | ARQ | Propuesta | [Sí / No] |
| D-ARQ-02 | Autenticación entre servicios y de los usuarios en los microservicios | ARQ | Propuesta | [Sí / No] |
| D-ARQ-03 | Acceso del frontend a los servicios (API Gateway) | ARQ | Propuesta | [Sí / No] |
| D-ARQ-04 | Base de datos por servicio y gestión del esquema | ARQ | Propuesta | [Sí / No] |
| D-ARQ-05 | Despliegue local, configuración externa y descubrimiento de servicios | ARQ | Propuesta | [Sí / No] |
| D-F1-01 | Alcance del dashboard frente a Explorar y Analítica, y vista por rol | F1 | Propuesta | [Sí / No] |
| D-F1-02 | Indicadores y endpoint de agregados | F1 | Propuesta | [Sí / No] |
| D-F1-03 | Carga de muchas incidencias en el mapa | F1 | Propuesta | [Sí / No] |
| D-F2-01 | Proveedor externo de imágenes | F2 | Propuesta | [Sí / No] |
| D-F2-02 | Flujo de subida, validación, miniaturas y borrado | F2 | Propuesta | [Sí / No] |
| D-F2-03 | Migración de los adjuntos actuales y comportamiento ante fallos del proveedor | F2 | Propuesta | [Sí / No] |
| D-F3-01 | Modelo de reporte ciudadano frente a incidencia normalizada | F3 | Propuesta | [Sí / No] |
| D-F3-02 | Criterio y modo de agrupación de reportes | F3 | Propuesta | [Sí / No] |
| D-F3-03 | Reportes sobre incidencias resueltas o cerradas; fusionar y separar incidencias | F3 | Propuesta | [Sí / No] |
| D-F3-04 | Trazabilidad, notificaciones y eventos de auditoría | F3 | Propuesta | [Sí / No] |
| D-F3-05 | Migración de las incidencias existentes | F3 | Propuesta | [Sí / No] |
| D-F4-01 | Datasets de Open Data Málaga seleccionados | F4 | Propuesta | [Sí / No] |
| D-F4-02 | Integración con AEMET | F4 | Propuesta | [Sí / No] |
| D-F4-03 | Base de datos propia y modelo normalizado | F4 | Propuesta | [Sí / No] |
| D-F4-04 | Planificación de la extracción y frecuencia por fuente | F4 | Propuesta | [Sí / No] |
| D-F4-05 | API que el microservicio expone al monolito | F4 | Propuesta | [Sí / No] |
| D-F4-06 | Destino de UrbanContext, ExternalObservation, los adaptadores mock y GECOR | F4 | Propuesta | [Sí / No] |
| D-F4-07 | Comportamiento ante fallos de las fuentes externas | F4 | Propuesta | [Sí / No] |
| D-F5-01 | Catálogo y esquema de los eventos de auditoría | F5 | Propuesta | [Sí / No] |
| D-F5-02 | Envío de eventos sin pérdidas | F5 | Propuesta | [Sí / No] |
| D-F5-03 | Base de datos de solo inserción | F5 | Propuesta | [Sí / No] |
| D-F5-04 | Relación con StatusChange | F5 | Propuesta | [Sí / No] |
| D-F5-05 | Rol AUDITOR y autorización en el microservicio | F5 | Propuesta | [Sí / No] |
| D-F5-06 | Dashboard de auditoría | F5 | Propuesta | [Sí / No] |
| D-RA1-01 | Formato común de paginación y endpoints afectados | RA1 | Propuesta | [Sí / No] |
| D-RA2-01 | UUID de la incidencia como clave entre servicios | RA2 | Propuesta | [Sí / No] |
| D-RA2-02 | Identificador de correlación en respuestas y logs | RA2 | Propuesta | [Sí / No] |
| D-RA3-01 | Patrones de resiliencia por componente | RA3 | Propuesta | [Sí / No] |
| D-RA3-02 | Health checks, readiness y degradación visible en la interfaz | RA3 | Propuesta | [Sí / No] |
| D-RA4-01 | Pila de observabilidad: métricas, logs estructurados y dashboards | RA4 | Propuesta | [Sí / No] |
| D-RA4-02 | Atributos de calidad, SLOs y escenarios k6 | RA4 | Propuesta | [Sí / No] |

### 8.1. Decisiones arquitectónicas derivadas

Se completa tras la validación: un enlace por cada ADR creado a partir de una decisión Aceptada o Modificada por el cliente.

| Decisión | ADR |
|---|---|
| [...] | [...] |

## 9. Plan de implementación e hitos

1. **Hito 1:** [Entrega demostrable].
2. **Hito 2:** [...].

**Dependencias entre áreas:** [...].

## 10. Estrategia de verificación

| Requisito | Prueba o experimento | Entorno y datos | Métrica y umbral | Evidencia esperada |
|---|---|---|---|---|
| RQ-... | [k6, integración, fallo inyectado] | [...] | [...] | [Informe, logs, test en CI] |

## 11. Riesgos y problemas abiertos

| ID | Tipo | Descripción | Impacto | Acción y responsable |
|---|---|---|---|---|
| R-1 | Riesgo | [...] | [...] | [...] |
| Q-1 | Pregunta | [...] | [...] | [...] |

### 11.1. Problemas resueltos

| ID | Decisión final | Fecha | Dónde se discutió |
|---|---|---|---|
| [...] | [...] | [...] | [...] |

## 12. Revisión y resultado

- **Comentarios de revisión:** [Resumen de las objeciones relevantes].
- **Resolución:** [Aceptado / pendiente / descartado].
- **Decisiones registradas:** [Ver 8.1].

## 13. Glosario

| Término | Definición |
|---|---|
| [...] | [...] |

## Checklist de aprobación

- [ ] Problema y alcance delimitados.
- [ ] Requisitos y restricciones documentados, sin atribuir al enunciado requisitos que no tiene.
- [ ] Al menos dos alternativas por decisión, o justificación de por qué no las hay.
- [ ] Diagramas, datos y contratos coherentes.
- [ ] Fallos, seguridad y operación considerados en proporción al cambio.
- [ ] Criterios de aceptación verificables y plan de pruebas reproducible.
- [ ] Riesgos y cuestiones abiertas explícitos.
- [ ] Revisión técnica realizada.
