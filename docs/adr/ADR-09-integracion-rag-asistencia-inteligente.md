# ADR-09: Integración de RAG para Asistencia Inteligente y Recomendación Basada en Normativa

- **Asunto (Issue):** 
  El personal municipal necesita asistencia para clasificar incidencias complejas y consultar los procedimientos o normativas urbanas aplicables (RF20).
  Debemos abordar esta decisión para definir la arquitectura que permita realizar consultas de Generación Aumentada por Recuperación (RAG) sobre la documentación normativa municipal sin incurrir en alucinaciones por parte de los modelos de IA.

- **Decisión (Decision):** 
  Indexar los documentos normativos y de procedimiento (entidad `KnowledgeDocument`) en un almacén vectorial/semántico desacoplado, permitiendo que la plataforma recupere fragmentos relevantes de normativa y los adjunte como evidencia y citas en las recomendaciones generadas para los operadores (RF20).

- **Estado (Status):** 
  Propuesta. Fuera del alcance del MVP: no está implementada (ver README, «Estado del proyecto y alcance»).

- **Grupo (Group):** 
  Inteligencia / Asistencia Asistida.

- **Supuestos (Assumptions):** 
  - Las respuestas de la IA actúan de forma estrictamente **asistencial** (humano en el bucle); la decisión final de resolución siempre la toma el operador o técnico municipal.
  - Toda recomendación generada indicará explícitamente su nivel de confianza y la cita del documento normativo consultado.

- **Restricciones (Constraints):** 
  - Los documentos fuente deben mantenerse versionados en la entidad `KnowledgeDocument`.
  - Las llamadas al componente RAG no deben interferir ni bloquear el rendimiento transaccional del backend.

- **Posiciones (Positions):** 
  1. **Arquitectura RAG con Búsqueda Semántica sobre `KnowledgeDocument` (Seleccionada):** Garantiza que las recomendaciones estén respaldadas por normativas reales con citas verificables (RF20).
  2. **Consultas a modelos de lenguaje sin contexto (LLM directo):** Alto riesgo de alucinaciones o respuestas contrarias a la normativa local de Málaga.

- **Argumento (Argument):** 
  Cumple plenamente con la visión del producto de UrbanPulse: *"La plataforma apoya al ciudadano, al operador municipal y al responsable de planificación sin sustituir la decisión humana en actuaciones sensibles"* y satisface el requisito RF20.

- **Implicaciones (Implications):** 
  - Creación de la entidad JPA `KnowledgeDocument` en el modelo de dominio.
  - Creación de un servicio de consulta semántica RAG que devuelve el texto de la recomendación respaldado por evidencias recuperadas.

- **Decisiones relacionadas (Related decisions):** 
  - *ADR-02:* Uso de Spring Boot y API REST en el Backend.
  - *ADR-05:* Implementación de la Máquina de Estados para el Ciclo de Vida de Incidencias.

- **Requisitos relacionados (Related requirements):** 
  - **RF20:** Asistencia inteligente (clasificación, priorización y recomendación con citas).

- **Artefactos relacionados (Related artifacts):** 
  - Entidad `KnowledgeDocument` en `com.urbanpulse.model`.
  - Subsistema/Servicio de Asistencia Inteligente y RAG.

- **Principios relacionados (Related principles):** 
  - **Explicabilidad y Citas:** Toda asistencia generada de forma automatizada debe aportar su justificación y evidencia recuperada.

- **Notas (Notes):** 
  Diseñado para la fase de capacidades avanzadas de la plataforma UrbanPulse.