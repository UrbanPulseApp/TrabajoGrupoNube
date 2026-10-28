# ADR-06: Manejo Centralizado de Excepciones REST mediante `@ControllerAdvice` y DTO `ApiError`

- **Asunto (Issue):** 
  Cuando ocurren errores en el backend (recurso no encontrado, datos inválidos en formulario, transiciones no permitidas), la API REST debe responder con un formato de error estandarizado y comprensible (Issue #13)[cite: 1].
  Debemos abordar esta decisión para evitar que el backend exponga trazas internas de Java (*stacktraces*) al cliente y permitir que el frontend React gestione y muestre mensajes de error claros al usuario[cite: 1, 2, 3].

- **Decisión (Decision):** 
  Adoptar un manejador global de excepciones en Spring Boot mediante la anotación `@ControllerAdvice` (clase `GlobalExceptionHandler`), que intercepta las excepciones y construye respuestas HTTP con una estructura JSON estandarizada representada por el DTO `ApiError` (`timestamp`, `status`, `error`, `message`, `path`)[cite: 1, 3].

- **Estado (Status):** 
  Decidida[cite: 1, 2].

- **Grupo (Group):** 
  Integración / API REST[cite: 1, 2].

- **Supuestos (Assumptions):** 
  - El frontend React implementará un interceptor de peticiones (vía Axios/Fetch) para procesar de forma uniforme la estructura de `ApiError`[cite: 1, 3].

- **Restricciones (Constraints):** 
  - Todas las excepciones personalizadas del dominio (`IncidentNotFoundException`, `InvalidTransitionException`, etc.) deben ser registradas dentro del `@ControllerAdvice`[cite: 1].

- **Posiciones (Positions):** 
  1. **Manejador Global con `@ControllerAdvice` y DTO `ApiError` (Seleccionada):** Centraliza el control de errores, limpia el código de los controladores y unifica el contrato de la API[cite: 1, 2, 3].
  2. **Bloques `try-catch` individuales en cada endpoint:** Repetitivo, difícil de mantener y propenso a omitir formatos de respuesta uniformes.

- **Argumento (Argument):** 
  Cumple con la tarea reflejada en la Issue #13 del repositorio y se ajusta a las especificaciones del documento *"Acuerdo y Diseño de la API REST"* del proyecto UrbanPulse[cite: 1, 3].

- **Implicaciones (Implications):** 
  - Creación de las clases `GlobalExceptionHandler` y `ApiError` en el backend (Issue #13)[cite: 1].
  - Garantiza la protección de datos internos al ocultar excepciones de infraestructura de la base de datos[cite: 1, 3].

- **Decisiones relacionadas (Related decisions):** 
  - *ADR-01:* Selección de React para la Interfaz de Usuario Front-end[cite: 1, 2, 3].
  - *ADR-02:* Uso de Spring Boot y API REST en el Backend[cite: 1, 2, 3].

- **Requisitos relacionados (Related requirements):** 
  - **RF03:** Registrar incidencia[cite: 1, 3].
  - **RF09:** Validación y rechazo con registro de motivos[cite: 3].

- **Artefactos relacionados (Related artifacts):** 
  - Issue #13 en GitHub (*GlobalExceptionHandler con DTO ApiError*)[cite: 1].
  - Documentación de acuerdo y diseño de la API REST[cite: 3].

- **Principios relacionados (Related principles):** 
  - **Estandarización de contratos:** La API debe ofrecer respuestas predecibles ante situaciones de éxito y fallo[cite: 3].

- **Notas (Notes):** 
  Tarea asignada en la planificación de iteraciones para la mejora de la robustez del servidor[cite: 1].