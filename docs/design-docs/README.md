# Documentos de diseño (Design Docs) — Iteración 2

Un *design document* (DD) describe cómo se propone resolver un cambio significativo, qué decisiones técnicas se toman y por qué se prefieren a otras alternativas. Sirve para revisar y **validar el diseño con el cliente antes de implementarlo**. Según el enunciado de la iteración 2, *«las propuestas de diseño de estas soluciones deben plasmarse en un documento de diseño y deben ser validadas por el cliente»*.

El DD es una propuesta. La documentación operativa (`docs/architecture.md`, `docs/api/acuerdo-api.md`, `docs/diagrama-C4/`) refleja el sistema realmente implementado, y las decisiones aceptadas se registran como ADR en [`docs/adr/`](../adr/).

## Índice

| DD | Título | Áreas | Responsables | Issue | Estado |
|---|---|---|---|---|---|
| [DD-001](DD-001-arquitectura-iteracion-2.md) | Arquitectura de la iteración 2 y requisitos de calidad | ARQ, RA1, RA2, RA3, RA4 | @JavierSantiburcio, @MarioMerZap | [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83) | Borrador |
| [DD-002](DD-002-microservicio-contexto-externo.md) | Microservicio de contexto externo (Open Data y AEMET) | F4 | @IvanPDcode, @GregorioMerchan | [#84](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/84) | Borrador |
| [DD-003](DD-003-microservicio-auditoria.md) | Microservicio de auditoría y rol AUDITOR | F5 | @IvanPDcode, @GregorioMerchan | [#85](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/85) | Borrador |
| [DD-004](DD-004-incidencias-imagenes-dashboard.md) | Incidencias normalizadas, imágenes externas y dashboard operativo | F3, F2, F1 | @NachoGarcia15, @MarioMerZap | [#86](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/86) | Borrador |

- **Plantilla:** [`_plantilla.md`](_plantilla.md).
- **Acta de validación con el cliente:** [`validacion-cliente.md`](validacion-cliente.md) ([#81](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/81)).
- **Épica:** [#80](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/80). **Reserva de números de ADR:** [#82](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/82).

### Códigos de área

| Código | Enunciado | DD |
|---|---|---|
| F1 | Dashboard para operadores municipales y técnicos | DD-004 |
| F2 | Servicio externo para subir las imágenes (p. ej. Cloudinary) | DD-004 |
| F3 | Unificación de reportes en una incidencia normalizada y trazabilidad | DD-004 |
| F4 | Microservicio de extracción de datos externos (Open Data + AEMET) | DD-002 |
| F5 | Microservicio de auditoría, rol AUDITOR y dashboard | DD-003 |
| ARQ | Paso de monolito a monolito + microservicios | DD-001 |
| RA1 | Paginación de los servicios REST de lectura masiva | DD-001 |
| RA2 | UUID de la incidencia para la trazabilidad entre microservicios | DD-001 |
| RA3 | Estrategias de fiabilidad y resiliencia | DD-001 |
| RA4 | Entorno de observabilidad (k6, Micrometer, logs estructurados, Prometheus, Grafana) | DD-001 |

## Proceso

```
Fase A: redactar el DD ──► revisión técnica (Reviewer) ──► validación con el cliente (#81)
        ──► Fase B: ADRs de las decisiones aceptadas ──► Fase C: revisar ADRs antiguos ──► consolidación (#82)
```

1. **Fase A.** Cada responsable redacta su DD en una rama propia creada desde `main` y abre una PR. El DD entra en `main` como `Borrador` o `En revisión`.
2. **Validación.** Cada responsable presenta su DD. El resultado de cada decisión se registra en el [acta](validacion-cliente.md) y en el propio DD (§8 y §12).
3. **Fase B.** Solo las decisiones `Aceptada` o `Modificada por el cliente` se convierten en ADR, con el número reservado antes en #82.
4. **Fase C.** Se revisan los ADRs antiguos listados en §5.1 de cada DD.
5. **Consolidación.** Índice de ADRs y coherencia final de la documentación viva.

## Convenciones

- **Ficheros:** `DD-NNN-slug.md`, sin espacios. Los diagramas van en `docs/design-docs/img/DD-NNN-*.drawio`, cada uno con su `.png`.
- **Solo decisiones de alto coste de error** (*penalty for being wrong*). La extensión es proporcional al riesgo: un área sencilla puede ocupar una página.
- **Decisiones numeradas por área:** `D-ARQ-01`, `D-RA1-01`, `D-F3-01`… Cada una incluye contexto, alternativas (al menos dos, o la justificación de por qué no las hay), propuesta, consecuencias y estado: `Propuesta | Aceptada | Rechazada | Modificada por el cliente`.
- **Cada DD incluye** sus *ADRs existentes afectados* (§5.1), los cambios propuestos a `acuerdo-api.md` (endpoints, DTOs, permisos) y al C4 (§7), y la sección *Decisiones arquitectónicas derivadas* (§8.1).
- **ADRs:** siguen el formato de los existentes (Asunto, Decisión, Estado, Grupo, Supuestos, Restricciones, Posiciones, Argumento, Implicaciones, Decisiones/Requisitos/Artefactos/Principios relacionados, Notas) y en *Notas* enlazan al DD y al `D-xx` de origen. El siguiente número libre es **ADR-15**; resérvalo en #82 antes de escribirlo.
- **Un ADR antiguo no se borra.** Su Estado pasa a `Sustituida por ADR-NN` u `Obsoleta`, con el motivo, y el ADR nuevo lo cita en *Decisiones relacionadas*. En la misma tarea se actualizan `docs/architecture.md`, `docs/diagrama-C4/`, `docs/api/acuerdo-api.md` e `ia-contexto.md` si les afecta.
- **Ramas** (GitHub Flow, desde `main`): `docs/dd-001-arquitectura`, `docs/dd-002-contexto-externo`, `docs/dd-003-auditoria`, `docs/dd-004-incidencias` para los DD; `docs/adr-<area>` para los ADR. Commits según Conventional Commits (`docs: ...`).

## Material de referencia

- *Documentos de Diseño de Software* (Prof. Eduardo Guzmán de los Riscos): anatomía, criterio del coste de equivocarse y proceso de revisión.
- *Patrones de diseño para microservicios*: descomposición, comunicación entre servicios, consistencia de datos, fiabilidad, acceso externo, observabilidad y despliegue.
