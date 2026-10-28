# ADR-05: Implementación de la Máquina de Estados para el Ciclo de Vida de Incidencias

- **Asunto (Issue):** 
  Una incidencia en UrbanPulse pasa por múltiples estados operacionales (`REPORTED`, `VALIDATED`, `REJECTED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `REOPENED`, `CLOSED`)[cite: 3].
  Debemos abordar esta decisión para evitar transiciones de estado inconsistentes (por ejemplo, pasar de `REPORTED` directamente a `RESOLVED` sin asignación o validación previa) y garantizar la auditoría completa requerida por los operarios municipales (RF12, RF18)[cite: 3].

- **Decisión (Decision):** 
  Encapsular las reglas del ciclo de vida dentro de un enumerado enriquecido o un gestor de estados en el dominio backend, exigiendo que cada cambio de estado registre de forma inmutable una entrada en la entidad relacional `StatusChange` con el usuario actor, fecha, motivo e identificador de la incidencia[cite: 3].

- **Estado (Status):** 
  Decidida[cite: 1, 2].

- **Grupo (Group):** 
  Lógica de Negocio / Dominio[cite: 1, 2].

- **Supuestos (Assumptions):** 
  - Solo los usuarios con roles autorizados (`OPERATOR`, `TECHNICIAN`, `ADMIN`) pueden ejecutar transiciones a partir del estado `VALIDATED` (RF02)[cite: 3].
  - Toda transición fallida o no permitida debe lanzar una excepción de negocio capturada por la API REST[cite: 1, 3].

- **Restricciones (Constraints):** 
  - Prohibido modificar de forma directa el campo de estado de una incidencia sin generar la correspondiente entidad de auditoría `StatusChange`[cite: 3].

- **Posiciones (Positions):** 
  1. **Máquina de estados estricta auditada en `StatusChange` (Seleccionada):** Garantiza integridad operacional y trazabilidad histórica completa[cite: 3].
  2. **Campo de texto/Enum simple sin validación de transición:** Propenso a inconsistencias por llamadas erróneas a la API REST.

- **Argumento (Argument):** 
  El documento del proyecto establece explícitamente que *"la incidencia conservará un ciclo de vida auditable"* y fija una matriz de transiciones estrictas (RF12, RF18)[cite: 3].

- **Implicaciones (Implications):** 
  - Creación de la entidad JPA `StatusChange` y su relación `@OneToMany` con `Incident`[cite: 3].
  - El frontend React podrá renderizar una línea de tiempo (*timeline*) con el historial del reporte (RF06)[cite: 3].

- **Decisiones relacionadas (Related decisions):** 
  - *ADR-02:* Uso de Spring Boot y API REST en el Backend[cite: 1, 2, 3].
  - *ADR-03:* Persistencia con PostgreSQL en Docker y Mapeo mediante JPA/Hibernate[cite: 1, 2, 3].

- **Requisitos relacionados (Related requirements):** 
  - **RF06:** Consulta y seguimiento[cite: 3].
  - **RF12:** Ciclo de vida[cite: 3].
  - **RF18:** Auditoría[cite: 3].

- **Artefactos relacionados (Related artifacts):** 
  - Entidades `Incident` y `StatusChange` en `com.urbanpulse.model`[cite: 1, 3].
  - Diagrama del ciclo de vida de la incidencia en la documentación del proyecto[cite: 3].

- **Principios relacionados (Related principles):** 
  - **Trazabilidad y Auditoría:** Todos los cambios operacionales sensibles en el sistema deben dejar huella inmutable[cite: 3].

- **Notas (Notes):** 
  Discutido y validado de acuerdo con la especificación del modelo de dominio de la Universidad de Málaga[cite: 2, 3].