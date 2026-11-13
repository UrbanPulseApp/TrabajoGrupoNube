# ADR-08: Paginación en Servidor y Filtros de Búsqueda para Visualización Territorial y Mapas

- **Asunto (Issue):** 
  Los operadores y personal municipal necesitan buscar, filtrar y visualizar grandes volúmenes de incidencias sobre mapas interactivos y listados por estado, distrito, categoría o prioridad (RF07, RF08, Issue #23).
  Debemos abordar esta decisión para evitar transferir miles de registros al navegador cliente en una sola petición HTTP, lo que congelaría la interfaz de usuario en React.

- **Decisión (Decision):** 
  Implementar la estrategia de paginación y ordenación en el lado del servidor utilizando las abstracciones `Pageable` y `Page<T>` de Spring Data JPA, ofreciendo endpoints de búsqueda filtrada que devuelven únicamente el subconjunto de incidencias necesario para la vista activa o el encuadre (*bounding box*) del mapa.

- **Estado (Status):** 
  Decidida.

- **Grupo (Group):** 
  Integración / Rendimiento.

- **Supuestos (Assumptions):** 
  - El frontend React transmitirá parámetros de consulta (`page`, `size`, `sort`, `status`, `district`) en las peticiones GET hacia la API REST.
  - Las coordenadas (latitud y longitud) se devolverán en la respuesta JSON para que librerías de mapas (como Leaflet) posicionen los marcadores dinámicamente.

- **Restricciones (Constraints):** 
  - Creación de índices en PostgreSQL sobre los campos más consultados (`status`, `district_id`, `created_at`) para agilizar las consultas paginadas.

- **Posiciones (Positions):** 
  1. **Paginación en Servidor con `Pageable` de Spring Data (Seleccionada):** Escalable y eficiente para grandes volúmenes de datos urbanos (Issue #23).
  2. **Carga completa en cliente (*Client-side pagination*):** Sencilla en fases iniciales pero inviable conforme aumenta la cantidad de reportes históricos.

- **Argumento (Argument):** 
  Aborda directamente la Issue #23 del repositorio (*Búsqueda con filtros combinados y paginación*) y satisface los requisitos funcionales RF07 y RF08.

- **Implicaciones (Implications):** 
  - Los controladores del backend utilizarán la anotación `@PageableDefault`.
  - El frontend React incorporará un componente de paginación para navegar entre resultados.

- **Decisiones relacionadas (Related decisions):** 
  - *ADR-01:* Selección de React para la Interfaz de Usuario Front-end.
  - *ADR-02:* Uso de Spring Boot y API REST en el Backend.

- **Requisitos relacionados (Related requirements):** 
  - **RF07:** Búsqueda y filtrado.
  - **RF08:** Mapa y capas urbanas.
  - **RF21:** Identificación por barrio y distrito.

- **Artefactos relacionados (Related artifacts):** 
  - Issue #23 en GitHub (*Búsqueda con filtros combinados y paginación*).
  - Controladores y servicios de consulta en `backend/`.

- **Principios relacionados (Related principles):** 
  - **Eficiencia y escalabilidad:** Minimizar el uso inútil de ancho de banda y memoria en el cliente.

- **Notas (Notes):** 
  Planificado para su integración tras consolidar las entidades del dominio principal.