# DD-001: Arquitectura de la iteración 2 y requisitos de calidad

> Borrador creado a partir de [`_plantilla.md`](_plantilla.md); convenciones en [README.md](README.md). Sustituye los campos `[entre corchetes]` y elimina las indicaciones que no necesites. Tareas y estado actual del repositorio: issue [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83).

| Metadato | Valor |
|---|---|
| Estado | Borrador |
| Autoría | @JavierSantiburcio (ARQ, RA1, RA2, RA3), @MarioMerZap (RA4) |
| Fecha de creación / última revisión | 2026-11-17 / 2026-11-17 |
| Iteración | 2 — Evolución de monolito a monolito + microservicios con paginación, trazabilidad, resiliencia y observabilidad comunes |
| Revisores | [Personas o roles] |
| Aprobación del cliente | Pendiente — ver [acta](validacion-cliente.md) |
| Prefijo de decisiones | `D-ARQ`, `D-RA1`, `D-RA2`, `D-RA3`, `D-RA4` |
| Enlaces | Issue [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83), épica [#80](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/80), [C4](../diagrama-C4/), [acuerdo-api](../api/acuerdo-api.md) |

## 1. Resumen ejecutivo

**Objetivo (una frase):** [Qué se consigue y para quién, en lenguaje claro].

[En 4–6 líneas: problema, solución propuesta, razón principal y principal riesgo.]

## 2. Contexto y problema

- **Situación actual verificable:** [Arquitectura o comportamiento existente y sus fuentes: ficheros, endpoints, entidades, pantallas].
- **Problema:** [Consecuencia observable para los usuarios, la operación o el equipo].
- **Motivación (enunciado de la iteración 2):**
  - «Todos los servicios REST de lectura masiva deben tener paginación.» (RA1)
  - «La incidencia tendrá un UUID que permita su trazabilidad entre los diferentes microservicios.» (RA2)
  - «Deberán diseñarse estrategias de fiabilidad y resiliencia de la aplicación, por ejemplo, qué pasa si alguno de los componentes (servicios externos, microservicios, etc.) no están disponibles durante la ejecución de la aplicación.» (RA3)
  - «Entorno de observabilidad de la aplicación que combine, k6, micrometer, logs estructurados, prometheus, grafana, etc. para poder evaluar los atributos de calidad.» (RA4)
  - Los microservicios de F4 y F5 deben tener «base de datos independiente» (ARQ).
- **Documentos relacionados:** [Otros DD, ADRs, informes de rendimiento, issues].

## 3. Objetivos, no objetivos y alcance

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

| ADR | Qué cambia con este diseño | Propuesta | Motivo |
|---|---|---|---|
| ADR-02 | Monolito modular → monolito + microservicios | A decidir (previsión: Sustituida por el ADR de `D-ARQ`) | [Completar] |
| ADR-03 | PostgreSQL con `ddl-auto` → ¿BD por servicio y migraciones versionadas? | A decidir | [Completar] |
| ADR-04 | Degradación con try-catch → patrones de resiliencia (coordinar con DD-002) | A decidir (previsión: Sustituida por el ADR de `D-RA3`) | [Completar] |
| ADR-06 | `ApiError` y `X-Request-ID` solo en errores; su texto no coincide con el `ApiError` actual | A decidir (previsión: Sustituida por el ADR de `D-RA2`) | [Completar] |
| ADR-08 | Paginación solo en `GET /api/incidents` (coordinar con F1 en DD-004) | A decidir (previsión: Sustituida por el ADR de `D-RA1`) | [Completar] |
| ADR-10 | UUID como clave entre servicios | Sigue vigente (el ADR nuevo lo cita) | [Completar] |
| ADR-12 | Autenticación entre servicios; rol AUDITOR (coordinar con DD-003) | A decidir | [Completar] |
| ADR-13 | Observabilidad restringida al perfil `k6` | A decidir (previsión: Sustituida por el ADR de `D-RA4`) | [Completar] |
| ADR-14 | Aislamiento de tests replicado en cada microservicio | Sigue vigente | [Completar] |

## 6. Decisiones y alternativas consideradas

> Una subsección por decisión de alto coste de error, numerada con el prefijo del área (`D-F3-01`, `D-F3-02`…). El estado lo actualiza la validación con el cliente.

### D-ARQ-01: Estilo de comunicación entre servicios (REST síncrono, mensajería o mixto)

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-ARQ-02: Autenticación entre servicios y de los usuarios frente a los microservicios

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-ARQ-03: Acceso del frontend a los servicios (API Gateway sí o no)

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-ARQ-04: Base de datos por servicio y gestión del esquema

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-ARQ-05: Despliegue local, configuración externa y descubrimiento de servicios

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-RA1-01: Formato común de paginación y endpoints de lectura masiva afectados

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-RA2-01: UUID de la incidencia como clave entre servicios

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-RA2-02: Propagación del correlationId (`X-Request-ID`) en respuestas y logs (MDC)

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-RA3-01: Matriz de fallos y patrones de resiliencia (timeouts, reintentos, circuit breaker, bulkhead, outbox)

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-RA3-02: Health checks, readiness y degradación visible en la UI

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-RA4-01: Pila de observabilidad (métricas, logs estructurados, Prometheus y Grafana)

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-RA4-02: Atributos de calidad, SLOs y escenarios k6

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

## 7. Diseño propuesto

### 7.1. Visión y diagramas C4

- **Contexto (L1):** [Enlace o «sin cambios»].
- **Contenedores (L2):** [Enlace y diferencias].
- **Componentes (L3):** [Solo si ayuda].
- **Secuencias / flujo de eventos / wireframes:** [Enlace o descripción]. Guarda los diagramas en un formato editable (`.drawio`) junto a su `.png`.

### 7.2. Interfaces y contratos

[Endpoints, eventos, versiones, esquema JSON, errores, idempotencia y compatibilidad. Referencia OpenAPI/AsyncAPI cuando proceda.]

**Cambios propuestos en [`acuerdo-api.md`](../api/acuerdo-api.md):**

| Método y ruta / evento | Cambio | DTOs (`*Request` / `*Response`) | Permisos (roles) | ¿Compatible? |
|---|---|---|---|---|
| [...] | Nuevo / Modificado / Eliminado | [...] | [...] | Sí / No |

### 7.3. Modelo y gestión de datos

[Entidades afectadas, titularidad, consistencia, migraciones, retención y recuperación. Identificadores `UUID` (ADR-10).]

### 7.4. Fallos, concurrencia y resiliencia

[Timeouts, reintentos, duplicados, orden, circuit breakers, degradación y recuperación. ¿Qué ve el usuario si este componente falla?]

### 7.5. Seguridad

[Identidad, autorización, secretos, amenazas, fronteras de confianza y datos sensibles.]

### 7.6. Privacidad y consideraciones legales

[Datos personales, retención, cifrado, licencias de datos (p. ej. CC BY 4.0 de Open Data Málaga), condiciones de uso de proveedores externos.]

### 7.7. Operación, observabilidad y despliegue

[Topología, contenedores, configuración externa, métricas, logs estructurados (eventos que se registran), alertas, escalado, reversión y costes.]

## 8. Registro de decisiones y trade-offs

| ID | Decisión propuesta | Beneficio | Coste / consecuencia | Estado | ¿Requiere ADR? |
|---|---|---|---|---|---|
| D-ARQ-01 | Estilo de comunicación entre servicios (REST síncrono, mensajería o mixto) | [...] | [...] | Propuesta | Sí / No |
| D-ARQ-02 | Autenticación entre servicios y de los usuarios frente a los microservicios | [...] | [...] | Propuesta | Sí / No |
| D-ARQ-03 | Acceso del frontend a los servicios (API Gateway sí o no) | [...] | [...] | Propuesta | Sí / No |
| D-ARQ-04 | Base de datos por servicio y gestión del esquema | [...] | [...] | Propuesta | Sí / No |
| D-ARQ-05 | Despliegue local, configuración externa y descubrimiento de servicios | [...] | [...] | Propuesta | Sí / No |
| D-RA1-01 | Formato común de paginación y endpoints de lectura masiva afectados | [...] | [...] | Propuesta | Sí / No |
| D-RA2-01 | UUID de la incidencia como clave entre servicios | [...] | [...] | Propuesta | Sí / No |
| D-RA2-02 | Propagación del correlationId (`X-Request-ID`) en respuestas y logs (MDC) | [...] | [...] | Propuesta | Sí / No |
| D-RA3-01 | Matriz de fallos y patrones de resiliencia (timeouts, reintentos, circuit breaker, bulkhead, outbox) | [...] | [...] | Propuesta | Sí / No |
| D-RA3-02 | Health checks, readiness y degradación visible en la UI | [...] | [...] | Propuesta | Sí / No |
| D-RA4-01 | Pila de observabilidad (métricas, logs estructurados, Prometheus y Grafana) | [...] | [...] | Propuesta | Sí / No |
| D-RA4-02 | Atributos de calidad, SLOs y escenarios k6 | [...] | [...] | Propuesta | Sí / No |

### 8.1. Decisiones arquitectónicas derivadas

> Se completa tras la validación: un enlace por cada ADR creado a partir de una decisión `Aceptada` o `Modificada por el cliente`. Cada ADR enlaza de vuelta a este documento y a su `D-xx`.

| Decisión | ADR |
|---|---|
| _Se completa tras la validación_ | |

## 9. Plan de implementación, hitos y migración

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

## 11. Riesgos, hipótesis y problemas abiertos

| ID | Tipo | Descripción | Impacto | Acción y responsable |
|---|---|---|---|---|
| H-1 | Hipótesis | [...] | [...] | [Experimento] |
| R-1 | Riesgo | [...] | [...] | [Mitigación] |
| Q-1 | Pregunta | [...] | [...] | [Decisión pendiente] |

### 11.1. Problemas resueltos

| ID | Decisión final | Fecha | Dónde se discutió |
|---|---|---|---|
| Q-... | [...] | [...] | [Issue, PR, acta] |

## 12. Revisión y resultado

- **Comentarios de revisión:** [Enlaces o resumen de las objeciones relevantes].
- **Resolución:** [Aceptado / pendiente / descartado].
- **Decisiones registradas:** [ADR, ver §8.1].
- **Diferencias observadas tras implementar:** [Qué cambió respecto al diseño, por qué y dónde se documentó].

## 13. Glosario

| Término | Definición |
|---|---|
| [...] | [...] |

## Checklist de aprobación

- [ ] Problema y alcance delimitados.
- [ ] Drivers y restricciones documentados, sin atribuir al enunciado requisitos inexistentes.
- [ ] Al menos dos alternativas comparadas por decisión, o justificación de por qué no hay alternativas viables.
- [ ] Diagramas, datos y contratos coherentes.
- [ ] Fallos, seguridad, operación y costes considerados en proporción al cambio.
- [ ] Criterios de aceptación verificables y plan de pruebas reproducible.
- [ ] Riesgos y cuestiones abiertas explícitos.
- [ ] ADRs existentes afectados identificados (§5.1) y cambios a `acuerdo-api.md` y al C4 descritos (§7).
- [ ] Revisión técnica realizada; ADRs enlazados en §8.1 cuando corresponda.
