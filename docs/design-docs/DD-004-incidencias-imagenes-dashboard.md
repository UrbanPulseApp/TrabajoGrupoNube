# DD-004: Incidencias normalizadas, imágenes externas y dashboard operativo

> Borrador creado a partir de [`_plantilla.md`](_plantilla.md); convenciones en [README.md](README.md). Sustituye los campos `[entre corchetes]` y elimina las indicaciones que no necesites. Tareas y estado actual del repositorio: issue [#86](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/86).

| Metadato | Valor |
|---|---|
| Estado | Borrador |
| Autoría | @NachoGarcia15 (F3, F1), @MarioMerZap (F2) |
| Fecha de creación / última revisión | 2026-11-17 / 2026-11-17 |
| Iteración | 2 — Cambios del monolito: unificación de reportes (F3), imágenes externas (F2) y dashboard (F1) |
| Revisores | [Personas o roles] |
| Aprobación del cliente | Pendiente — ver [acta](validacion-cliente.md) |
| Prefijo de decisiones | `D-F3`, `D-F2`, `D-F1` |
| Enlaces | Issue [#86](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/86), épica [#80](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/80), [C4](../diagrama-C4/), [acuerdo-api](../api/acuerdo-api.md) |

## 1. Resumen ejecutivo

**Objetivo (una frase):** [Qué se consigue y para quién, en lenguaje claro].

[En 4–6 líneas: problema, solución propuesta, razón principal y principal riesgo.]

## 2. Contexto y problema

- **Situación actual verificable:** [Arquitectura o comportamiento existente y sus fuentes: ficheros, endpoints, entidades, pantallas].
- **Problema:** [Consecuencia observable para los usuarios, la operación o el equipo].
- **Motivación (enunciado de la iteración 2):**
  - «Unificación en una única incidencia normalizada de los reportes de incidencias procedentes de diferentes ciudadanos. Trazabilidad de los reportes con la incidencia normalizada.» (F3)
  - «Servicio externo para subir las imágenes de las incidencias (por ejemplo, cloudinary).» (F2)
  - «Dashboard para los operadores municipales y técnicos con una mapa que incluya, al menos, las incidencias, indicadores generales con datos y posibilidades de filtrado de incidencias.» (F1)
  - Extensión proporcional al riesgo: F3 cambia el modelo de dominio; F2 y F1 caben en una página cada una.
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
| ADR-07 | Adjuntos en disco → proveedor externo de imágenes | A decidir (previsión: Sustituida por el ADR de `D-F2`) | [Completar] |
| ADR-11 | Detección preventiva de duplicados → agrupación de reportes | A decidir (previsión: vigente y ampliada por `D-F3`) | [Completar] |
| ADR-05 | Máquina de estados: reconciliar transiciones y efecto de fusionar o separar (coordinar con DD-003) | A decidir | [Completar] |
| ADR-08 | Carga de incidencias en el mapa del dashboard (coordinar con `D-RA1` en DD-001) | A decidir | [Completar] |
| ADR-01 | Nuevas vistas en la SPA | Sigue vigente | [Completar] |

## 6. Decisiones y alternativas consideradas

> Una subsección por decisión de alto coste de error, numerada con el prefijo del área (`D-F3-01`, `D-F3-02`…). El estado lo actualiza la validación con el cliente.

### D-F3-01: Modelo reporte ciudadano – incidencia normalizada (N:1)

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-F3-02: Criterio y modo de agrupación de reportes (automático o confirmado por un operador)

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-F3-03: Reportes sobre incidencias resueltas o cerradas; fusionar y separar incidencias

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-F3-04: Trazabilidad, notificaciones y eventos de auditoría

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-F3-05: Migración de las incidencias existentes

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-F2-01: Proveedor externo de imágenes

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-F2-02: Flujo de subida, validación, miniaturas y borrado (incluidos los PDF)

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-F2-03: Migración de los adjuntos actuales y comportamiento ante fallos del proveedor

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-F1-01: Alcance del dashboard frente a Explorar y Analítica, y vista por rol

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-F1-02: Indicadores y endpoint de agregados

- **Contexto:** [Qué hay que decidir y por qué importa].

| Alternativa | Descripción | Ventajas | Inconvenientes / riesgos | Evidencia disponible |
|---|---|---|---|---|
| A | [...] | [...] | [...] | [...] |
| B | [...] | [...] | [...] | [...] |

- **Criterios de comparación:** [Complejidad, coste, disponibilidad, latencia, evolución, seguridad...].
- **Propuesta:** [Alternativa elegida y por qué supera a las otras respecto a los drivers prioritarios].
- **Consecuencias:** [Qué implica: cambios, deuda, riesgos aceptados].
- **Estado:** `Propuesta` | `Aceptada` | `Rechazada` | `Modificada por el cliente`

### D-F1-03: Carga de muchas incidencias en el mapa (bbox, clustering)

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
| D-F3-01 | Modelo reporte ciudadano – incidencia normalizada (N:1) | [...] | [...] | Propuesta | Sí / No |
| D-F3-02 | Criterio y modo de agrupación de reportes (automático o confirmado por un operador) | [...] | [...] | Propuesta | Sí / No |
| D-F3-03 | Reportes sobre incidencias resueltas o cerradas; fusionar y separar incidencias | [...] | [...] | Propuesta | Sí / No |
| D-F3-04 | Trazabilidad, notificaciones y eventos de auditoría | [...] | [...] | Propuesta | Sí / No |
| D-F3-05 | Migración de las incidencias existentes | [...] | [...] | Propuesta | Sí / No |
| D-F2-01 | Proveedor externo de imágenes | [...] | [...] | Propuesta | Sí / No |
| D-F2-02 | Flujo de subida, validación, miniaturas y borrado (incluidos los PDF) | [...] | [...] | Propuesta | Sí / No |
| D-F2-03 | Migración de los adjuntos actuales y comportamiento ante fallos del proveedor | [...] | [...] | Propuesta | Sí / No |
| D-F1-01 | Alcance del dashboard frente a Explorar y Analítica, y vista por rol | [...] | [...] | Propuesta | Sí / No |
| D-F1-02 | Indicadores y endpoint de agregados | [...] | [...] | Propuesta | Sí / No |
| D-F1-03 | Carga de muchas incidencias en el mapa (bbox, clustering) | [...] | [...] | Propuesta | Sí / No |

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
