# Documento de diseño — Iteración 2

Un documento de diseño describe cómo se propone resolver un cambio significativo, qué decisiones técnicas se toman y por qué se prefieren a otras alternativas. Sirve para revisar y **validar el diseño con el cliente antes de implementarlo**. Según el enunciado de la iteración 2, *«las propuestas de diseño de estas soluciones deben plasmarse en un documento de diseño y deben ser validadas por el cliente»*.

La iteración 2 tiene **un único documento de diseño**, [`documento-diseno-iteracion-2.md`](documento-diseno-iteracion-2.md), con una sección por área. Cada sección tiene uno o varios responsables.

El documento es una propuesta. La documentación operativa (`docs/architecture.md`, `docs/api/acuerdo-api.md`, `docs/diagrama-C4/`) refleja el sistema realmente implementado, y las decisiones aceptadas se registran como ADR en [`docs/adr/`](../adr/).

## Entregas

| Versión | Contenido | Fecha límite | Issue |
|---|---|---|---|
| **v0.1 (preliminar)** | Los cambios que se van a realizar: secciones marcadas con ★ en el documento | Lunes **30-11-2026, 23:59** (Campus Virtual). Fecha objetivo interna para fusionar las áreas: domingo 29-11 | [#88](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/88) |
| v1.0 (validación) | Documento completo y revisado técnicamente | [Fecha de la sesión con el cliente] | [#81](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/81) |

## Responsables

| Sección del documento | Áreas | Responsables | Issue | Rama |
|---|---|---|---|---|
| §1–§3, §8, §9, §11–§13 (comunes) e integración | — | @NachoGarcia15 | [#88](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/88) | `docs/diseno-comunes` |
| §5, §6.1, §6.7–§6.9, §7.1–§7.5 | ARQ, RA1, RA2, RA3 | @JavierSantiburcio | [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83) | `docs/diseno-arquitectura` |
| §4, §6.10, §7.7, §10 | RA4 | @MarioMerZap | [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83) | `docs/diseno-observabilidad` |
| §6.5, §7.6 | F4 | @IvanPDcode, @GregorioMerchan | [#84](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/84) | `docs/diseno-contexto-externo` |
| §6.6 | F5 | @IvanPDcode, @GregorioMerchan | [#85](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/85) | `docs/diseno-auditoria` |
| §6.2, §6.4 | F1, F3 | @NachoGarcia15 | [#86](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/86) | `docs/diseno-incidencias` |
| §6.3 | F2 | @MarioMerZap | [#86](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/86) | `docs/diseno-imagenes` |

- **Plantilla de referencia:** [`_plantilla.md`](_plantilla.md) (estructura completa de un documento de diseño y bloque de decisión).
- **Acta de validación con el cliente:** [`validacion-cliente.md`](validacion-cliente.md) ([#81](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/81)).
- **Épica:** [#80](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/80). **Reserva de números de ADR:** [#82](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/82).

### Códigos de área

| Código | Enunciado | Sección |
|---|---|---|
| ARQ | Paso de monolito a monolito + microservicios | §6.1 |
| F1 | Dashboard para operadores municipales y técnicos | §6.2 |
| F2 | Servicio externo para subir las imágenes (p. ej. Cloudinary) | §6.3 |
| F3 | Unificación de reportes en una incidencia normalizada y trazabilidad | §6.4 |
| F4 | Microservicio de extracción de datos externos (Open Data + AEMET) | §6.5 |
| F5 | Microservicio de auditoría, rol AUDITOR y dashboard | §6.6 |
| RA1 | Paginación de los servicios REST de lectura masiva | §6.7 |
| RA2 | UUID de la incidencia para la trazabilidad entre microservicios | §6.8 |
| RA3 | Estrategias de fiabilidad y resiliencia | §6.9 |
| RA4 | Entorno de observabilidad (k6, Micrometer, logs estructurados, Prometheus, Grafana) | §6.10 |

## Proceso

```
Fase A: redactar cada sección ──► v0.1 al CV (#88) ──► revisión técnica ──► validación con el cliente (#81)
        ──► Fase B: ADRs de las decisiones aceptadas ──► Fase C: revisar ADRs antiguos ──► consolidación (#82)
```

1. **Fase A.** Cada responsable redacta sus secciones en su rama, creada desde `main`, y abre una PR que **solo toca sus secciones**. Las áreas que dependen de `D-ARQ` (F4 y F5) pueden empezar por contexto, alternativas y modelo de datos mientras se cierran `D-ARQ-01` y `D-ARQ-02`.
2. **Entrega v0.1.** El coordinador (#88) fusiona las PRs, redacta las secciones comunes, exporta el documento a PDF y lo sube al Campus Virtual.
3. **Validación.** Cada responsable presenta su área. El resultado de cada decisión se registra en el [acta](validacion-cliente.md) y en el propio documento (§6, §8 y §12).
4. **Fase B.** Solo las decisiones `Aceptada` o `Modificada por el cliente` se convierten en ADR, con el número reservado antes en #82.
5. **Fase C.** Se revisan los ADRs antiguos listados en §5.1.
6. **Consolidación.** Índice de ADRs y coherencia final de la documentación viva.

## Convenciones

- **Un solo fichero, una sección por responsable.** Edita solo tus secciones para que las PRs de cada área se fusionen sin conflictos. Si necesitas algo de otra área, cítala por su identificador (`ver D-ARQ-01`) o coméntalo en su issue. Las tablas compartidas (§5.1, §7.4, §8 y §11) las completa su responsable o el coordinador.
- **★ marca el mínimo de la v0.1:** por área, *Cambios que proponemos*, y en cada decisión *Contexto*, al menos dos *Alternativas* y la *Propuesta*; además, las *Cuestiones abiertas para el cliente*, el resumen, el contexto, el alcance y el diagrama C4 L2 objetivo.
- **Solo decisiones de alto coste de error** (*penalty for being wrong*). La extensión es proporcional al riesgo: un área sencilla (F1, F2) puede ocupar una página.
- **Decisiones numeradas por área:** `D-ARQ-01`, `D-RA1-01`, `D-F3-01`… Cada una incluye contexto, alternativas (al menos dos, o la justificación de por qué no las hay), propuesta, consecuencias y estado: `Propuesta | Aceptada | Rechazada | Modificada por el cliente`. Para añadir una decisión, copia el bloque de decisión de [`_plantilla.md`](_plantilla.md) y añádela también a la tabla de §8.
- **Cuestiones abiertas** numeradas por área: `Q-F3-1`, `Q-ARQ-1`…
- **Diagramas:** en `docs/design-docs/img/<area>-<nombre>.drawio`, cada uno con su `.png`.
- **ADRs:** siguen el formato de los existentes (Asunto, Decisión, Estado, Grupo, Supuestos, Restricciones, Posiciones, Argumento, Implicaciones, Decisiones/Requisitos/Artefactos/Principios relacionados, Notas) y en *Notas* enlazan al documento y al `D-xx` de origen. El siguiente número libre es **ADR-15**; resérvalo en #82 antes de escribirlo.
- **Un ADR antiguo no se borra.** Su Estado pasa a `Sustituida por ADR-NN` u `Obsoleta`, con el motivo, y el ADR nuevo lo cita en *Decisiones relacionadas*. En la misma tarea se actualizan `docs/architecture.md`, `docs/diagrama-C4/`, `docs/api/acuerdo-api.md` e `ia-contexto.md` si les afecta.
- **Ramas** (GitHub Flow, desde `main`): las de la tabla *Responsables* para el documento; `docs/adr-<area>` para los ADR. Commits según Conventional Commits (`docs: ...`).

## Exportar a PDF

El Campus Virtual recibe un PDF. Cualquiera de estas opciones conserva las tablas:

- **VS Code:** extensión *Markdown PDF* → abrir el documento → `Markdown PDF: Export (pdf)`.
- **pandoc** (si está instalado):

      pandoc docs/design-docs/documento-diseno-iteracion-2.md -o documento-diseno-iteracion-2-v0.1.pdf

Antes de exportar la v0.1, el coordinador comprueba que las partes ★ no tienen `[campos entre corchetes]` y que se han borrado las indicaciones (citas `>` con instrucciones). Las secciones que aún no se hayan redactado pueden quedar marcadas como «Pendiente para la v1.0».

## Material de referencia

- *Documentos de Diseño de Software* (Prof. Eduardo Guzmán de los Riscos): anatomía, criterio del coste de equivocarse y proceso de revisión.
- *Patrones de diseño para microservicios*: descomposición, comunicación entre servicios, consistencia de datos, fiabilidad, acceso externo, observabilidad y despliegue.
