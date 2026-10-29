# ADR-09: Integración de RAG para Asistencia Inteligente y Recomendación Basada en Normativa

- **Asunto (Issue):** 
  El personal municipal necesita asistencia para clasificar incidencias complejas y consultar los procedimientos o normativas urbanas aplicables (RF20)[cite: 3].
  Debemos abordar esta decisión para definir la arquitectura que permita realizar consultas de Generación Aumentada por Recuperación (RAG) sobre la documentación normativa municipal sin incurrir en alucinaciones por parte de los modelos de IA[cite: 3].

- **Decisión (Decision):** 
  Indexar los documentos normativos y de procedimiento (entidad `KnowledgeDocument`) en un almacén vectorial/semántico desacoplado, permitiendo que la plataforma recupere fragmentos relevantes de normativa y los adjunte como evidencia y citas en las recomendaciones generadas para los operadores (RF20)[cite: 3].

- **Estado (Status):** 
  Decidida[cite: 1, 2].

- **Grupo (Group):** 
  Inteligencia / Asistencia Asistida[cite: 1, 2].

- **Supuestos (Assumptions):** 
  - Las respuestas de la IA actúan de forma estrictamente **asistencial** (humano en el bucle); la decisión final de resolución siempre la toma el operador o técnico municipal[cite: 3].
  - Toda recomendación generada indicará explícitamente su nivel de confianza y la cita del documento normativo consultado[cite: 3].

- **Restricciones (Constraints):** 
  - Los documentos fuente deben mantenerse versionados en la entidad `KnowledgeDocument`[cite: 3].
  - Las llamadas al componente RAG no deben interferir ni bloquear el rendimiento transaccional del backend[cite: 3].

- **Posiciones (Positions):** 
  1. **Arquitectura RAG con Búsqueda Semántica sobre `KnowledgeDocument` (Seleccionada):** Garantiza que las recomendaciones estén respaldadas por normativas reales con citas verificables (RF20)[cite: 3].
  2. **Consultas a modelos de lenguaje sin contexto (LLM directo):** Alto riesgo de alucinaciones o respuestas contrarias a la normativa local de Málaga.

- **Argumento (Argument):** 
  Cumple plenamente con la visión del producto de UrbanPulse: *"La plataforma apoya al ciudadano, al operador municipal y al responsable de planificación sin sustituir la decisión humana en actuaciones sensibles"* y satisface el requisito RF20[cite: 3].

- **Implicaciones (Implications):** 
  - Creación de la entidad JPA `KnowledgeDocument` en el modelo de dominio[cite: 3].
  - Creación de un servicio de consulta semántica RAG que devuelve el texto de la recomendación respaldado por evidencias recuperadas[cite: 3].

- **Decisiones relacionadas (Related decisions):** 
  - *ADR-02:* Uso de Spring Boot y API REST en el Backend[cite: 1, 2, 3].
  - *ADR-05:* Implementación de la Máquina de Estados para el Ciclo de Vida de Incidencias[cite: 3].

- **Requisitos relacionados (Related requirements):** 
  - **RF20:** Asistencia inteligente (clasificación, priorización y recomendación con citas)[cite: 3].

- **Artefactos relacionados (Related artifacts):** 
  - Entidad `KnowledgeDocument` en `com.urbanpulse.model`[cite: 3].
  - Subsistema/Servicio de Asistencia Inteligente y RAG[cite: 3].

- **Principios relacionados (Related principles):** 
  - **Explicabilidad y Citas:** Toda asistencia generada de forma automatizada debe aportar su justificación y evidencia recuperada[cite: 3].

- **Notas (Notes):** 
  Diseñado para la fase de capacidades avanzadas de la plataforma UrbanPulse[cite: 3].