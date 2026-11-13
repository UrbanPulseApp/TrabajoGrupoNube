# ADR-02: Uso de Spring Boot y API REST en el Backend

- **Asunto (Issue):** 
  El sistema UrbanPulse requiere un núcleo de backend robusto para la gestión centralizada de incidencias urbanas, orquestación del ciclo de vida (`REPORTED`, `VALIDATED`, `ASSIGNED`, etc.), procesamiento de lógica de negocio y exposición de datos hacia el frontend en React y futuros clientes (RF01-RF18). 
  Debemos abordar esta decisión en la fase inicial del proyecto para establecer las bases de la arquitectura del servidor, facilitando la colaboración en paralelo mediante controladores e interfaces bien definidas sin bloquear las tareas de frontend ni la persistencia de datos.

- **Decisión (Decision):** 
  Adoptar **Spring Boot (Java 11)** como framework para la construcción de una arquitectura monolítica modular en el backend, exponiendo servicios web mediante una **API RESTful** fundamentada en el intercambio de JSON y códigos de estado HTTP estandarizados.

- **Estado (Status):** 
  Decidida.

- **Grupo (Group):** 
  Integración / Lógica de negocio (Backend).

- **Supuestos (Assumptions):** 
  - El entorno de ejecución dispone de la Máquina Virtual de Java (JDK 11) configurada en los entornos de desarrollo y despliegue.
  - La arquitectura inicial se mantendrá como un monolito sencillo, desacoplado funcionalmente por paquetes (`com.urbanpulse.model`, `com.urbanpulse.external`, etc.) para permitir su posterior evolución hacia microservicios si se identifica la necesidad.
  - La comunicación entre el cliente (React) y la aplicación se realizará exclusivamente de manera asíncrona sobre HTTP/HTTPS mediante una API REST.

- **Restricciones (Constraints):** 
  - Todos los endpoints REST de la aplicación deben seguir una nomenclatura uniforme y devolver respuestas de error estandarizadas (ej. DTO `ApiError`).
  - Se debe habilitar y configurar explícitamente el soporte para Cross-Origin Resource Sharing (CORS) para permitir peticiones provenientes del origen del frontend (`localhost:5173` o puerto asignado a React).
  - Exige el uso de librerías de serialización/deserialización JSON (como Jackson) e inyección de dependencias nativas de Spring Framework.

- **Posiciones (Positions):** 
  1. **Spring Boot (Java 11) + API REST:** Framework maduro para aplicaciones empresariales que integra soporte nativo para persistencia (Spring Data JPA), seguridad (Spring Security) y controladores REST de manera transparente.
  2. **Node.js con Express:** Entorno de ejecución ligero en JavaScript, adecuado para alto I/O, pero con menos convenciones estructurales por defecto para modelos de dominio complejos y tipado estricto.
  3. **Frameworks alternativos en Java (Quarkus / Micronaut):** Alternativas de menor consumo de memoria y rápido arranque, pero con una curva de aprendizaje ligeramente mayor e integración menos extendida en los entornos académicos/comunitarios del equipo.

- **Argumento (Argument):** 
  Se selecciona **Spring Boot** por las siguientes razones principales:
  - **Madurez del ecosistema e integración:** Facilita la configuración rápida (*convention over configuration*) y proporciona módulos nativos como Spring Data JPA, lo que agiliza la definición de repositorios y entidades (`User`, `Assignment`, `Incident`).
  - **Desacoplamiento y mantenibilidad:** La arquitectura RESTful permite trabajar en la lógica del backend e issues asociadas (`#17`, `#19`, `#20`) mientras el equipo de frontend desarrolla la UI en React (`#21`), comunicándose únicamente a través de contratos de API REST (`/api/incidents`).
  - **Alineación con pautas de diseño:** Sigue la pauta de adoptar la solución más sencilla y mantenible para construir el MVP en el plazo establecido de semana y media.

- **Implicaciones (Implications):** 
  - Es necesario definir contratos de API claros (endpoints, DTOs, códigos de respuesta) antes o durante el desarrollo para evitar desalineaciones entre backend y frontend.
  - Requiere estructurar adecuadamente la capa de controladores (`@RestController`), servicios (`@Service`) y repositorios (`@Repository`).
  - Permite realizar pruebas de integración y unitarias aisladas sobre la API antes de conectarla con el cliente final.

- **Decisiones relacionadas (Related decisions):** 
  - *ADR-01:* Selección de React para la Interfaz de Usuario Front-end.
  - *ADR-03:* Uso de PostgreSQL sobre contenedores Docker para el entorno de persistencia.

- **Requisitos relacionados (Related requirements):** 
  - **RF01:** Identidad y acceso (autenticación y servicios REST seguros).
  - **RF03:** Registrar incidencia (endpoint POST para recepción de datos de incidencias).
  - **RF07:** Búsqueda y filtrado (endpoints GET parametrizados).
  - **RF12:** Ciclo de vida de la incidencia (lógica de estado en la capa de servicio).
  - **RF26:** Degradación controlada (manejo de fallos en llamadas a APIs externas).

- **Artefactos relacionados (Related artifacts):** 
  - Módulo `backend/` (proyecto Java/Maven con Spring Boot).
  - Documentación del acuerdo y diseño de la API REST.
  - Diagrama C4 de Contenedores (relación API REST Backend - Base de datos).
  - Issues `#17`, `#19`, `#20` en GitHub.

- **Principios relacionados (Related principles):** 
  - **Diseño orientado a la simplicidad:** "Se adopta la solución más sencilla que satisfaga los atributos de calidad medidos".
  - **Independencia de cliente:** La lógica de negocio expuesta por la API REST no debe asumir ni depender de la implementación concreta de un cliente específico.

- **Notas (Notes):** 
  Durante las sesiones de organización del grupo, se estableció que la versión objetivo de Java para el backend en esta fase es Java 11. Para acelerar el desarrollo del MVP, los controladores responderán inicialmente a peticiones usando la base de datos PostgreSQL montada en Docker Compose.