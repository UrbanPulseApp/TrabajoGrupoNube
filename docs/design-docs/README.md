# Documento de diseño de la iteración 2

El documento de diseño recoge los cambios que se proponen para la iteración 2, las alternativas consideradas y por qué se elige cada una. Se valida con el cliente (el profesor de la asignatura) antes de implementar, y las decisiones aceptadas se registran después como ADR en [docs/adr](../adr/).

- [documento-diseno.md](documento-diseno.md): el documento, con una sección por área.
- [validacion-cliente.md](validacion-cliente.md): acta de la validación.
- Épica: [#80](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/80). Reserva de números de ADR: [#82](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/82).

## Quién escribe qué

| Sección | Área | Responsables | Issue | Rama |
|---|---|---|---|---|
| 1, 2, 3, 11, 12 y 13 | Partes comunes | @NachoGarcia15 | [#80](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/80) | `docs/diseno-comunes` |
| 5, 6.1, 6.7 a 6.9 y 7.1 a 7.5 | Arquitectura, RA1 a RA3 | @JavierSantiburcio | [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83) | `docs/diseno-arquitectura` |
| 4, 6.10, 7.7 y 10 | Observabilidad (RA4) | @MarioMerZap | [#83](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/83) | `docs/diseno-observabilidad` |
| 6.2 y 6.4 | Dashboard (F1) y unificación de reportes (F3) | @NachoGarcia15 | [#86](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/86) | `docs/diseno-incidencias` |
| 6.3 | Imágenes externas (F2) | @MarioMerZap | [#86](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/86) | `docs/diseno-imagenes` |
| 6.5 | Contexto externo (F4) | @IvanPDcode, @GregorioMerchan | [#84](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/84) | `docs/diseno-contexto-externo` |
| 6.6 | Auditoría (F5) | @IvanPDcode, @GregorioMerchan | [#85](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/85) | `docs/diseno-auditoria` |

Las secciones 7.6, 8 y 9 son compartidas: cada responsable añade las filas de su área.

## Cómo trabajar

1. Crea tu rama desde `main` actualizado: `git switch main && git pull && git switch -c docs/diseno-...`.
2. Edita solo tus secciones. Así casi no habrá conflictos al fusionar.
3. Abre una PR con `Refs #N` (no `Closes`) y pide la revisión de un compañero.
4. Al fusionar, borra la rama.

## Convenciones

- Solo decisiones difíciles de revertir. Cada una lleva contexto, al menos dos alternativas, propuesta, consecuencias y estado.
- Numeración por área: `D-ARQ-01`, `D-F3-02`, `D-RA1-01`.
- Tras la validación, cada decisión aceptada se convierte en un ADR con el formato de los existentes. El número se reserva antes en [#82](https://github.com/UrbanPulseApp/TrabajoGrupoNube/issues/82). Los ADR antiguos no se borran: se marcan como "Sustituida por ADR-NN" u "Obsoleta".
