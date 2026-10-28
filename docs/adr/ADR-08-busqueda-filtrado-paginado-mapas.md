# ADR-08: Paginación en Servidor y Filtros de Búsqueda para Visualización Territorial y Mapas

- **Asunto (Issue):** 
  Los operadores y personal municipal necesitan buscar, filtrar y visualizar grandes volúmenes de incidencias sobre mapas interactivos y listados por estado, distrito, categoría o prioridad (RF07, RF08, Issue #23)[cite: 1, 3].
  Debemos abordar esta decisión para evitar transferir miles de registros al navegador cliente en una sola petición HTTP, lo que congelaría la interfaz de usuario en React[cite: 1, 3].

- **Decisión (Decision):** 
  Implementar la estrategia de paginación y ordenación en el lado del servidor utilizando las abstracciones `Pageable` y `Page<T>` de Spring Data JPA, ofreciendo endpoints de búsqueda filtrada que devuelven únicamente el subconjunto de incidencias necesario para la vista activa o el encuadre (*bounding box*) del mapa[cite: 1, 3].

- **Estado (Status):** 
  Decidida[cite: 1, 2].

- **Grupo (Group):** 
  Integración / Rendimiento[cite: 1, 2].

- **Supuestos (Assumptions):** 
  - El frontend React transmitirá parámetros de consulta (`page`, `size`, `sort`, `status`, `district`) en las peticiones GET hacia la API REST[cite: 1, 3].
  - Las coordenadas (latitud y longitud) se devolverán en la respuesta JSON para que librerías de mapas (como Leaflet) posicionen los marcadores dinámicamente[cite: 1, 3].

- **Restricciones (Constraints):** 
  - Creación de índices en PostgreSQL sobre los campos más consultados (`status`, `district_id`, `created_at`) para agilizar las consultas paginadas[cite: 1, 3].

- **Posiciones (Positions):** 
  1. **Paginación en Servidor con `Pageable` de Spring Data (Seleccionada):** Escalable y eficiente para grandes volúmenes de datos urbanos (Issue #23)[cite: 1, 3].
  2. **Carga completa en cliente (*Client-side pagination*):** Sencilla en fases iniciales pero inviable conforme aumenta la cantidad de reportes históricos.

- **Argumento (Argument):** 
  Aborda directamente la Issue #23 del repositorio (*Búsqueda con filtros combinados y paginación*) y satisface los requisitos funcionales RF07 y RF08[cite: 1, 3].

- **Implicaciones (Implications):** 
  - Los controladores del backend utilizarán la anotación `@PageableDefault`[cite: 1].
  - El frontend React incorporará un componente de paginación para navegar entre resultados[cite: 1, 3].

- **Decisiones relacionadas (Related decisions):** 
  - *ADR-01:* Selección de React para la Interfaz de Usuario Front-end[cite: 1, 2, 3].
  - *ADR-02:* Uso de Spring Boot y API REST en el Backend[cite: 1, 2, 3].

- **Requisitos relacionados (Related requirements):** 
  - **RF07:** Búsqueda y filtrado[cite: 3].
  - **RF08:** Mapa y capas urbanas[cite: 3].
  - **RF21:** Identificación por barrio y distrito[cite: 3].

- **Artefactos relacionados (Related artifacts):** 
  - Issue #23 en GitHub (*Búsqueda con filtros combinados y paginación*)[cite: 1].
  - Controladores y servicios de consulta en `backend/`[cite: 1].

- **Principios relacionados (Related principles):** 
  - **Eficiencia y escalabilidad:** Minimizar el uso inútil de ancho de banda y memoria en el cliente[cite: 3].

- **Notas (Notes):** 
  Planificado para su integración tras consolidar las entidades del dominio principal[cite: 1].