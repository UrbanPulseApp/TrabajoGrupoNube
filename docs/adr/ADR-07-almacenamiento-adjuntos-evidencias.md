# ADR-07: Gestión y Almacenamiento de Evidencias Multimedia fuera de la Base Relacional

- **Asunto (Issue):** 
  Los ciudadanos y técnicos pueden adjuntar fotografías o vídeos como evidencias al registrar o resolver una incidencia (RF05, RF13)[cite: 3].
  Debemos abordar esta decisión para evitar sobrecargar la base de datos PostgreSQL con objetos binarios pesados (BLOBs), lo que degradaría el rendimiento de las consultas y backups relacionales[cite: 1, 3].

- **Decisión (Decision):** 
  Almacenar los archivos multimedia binarios en el sistema de archivos local del servidor (o almacenamiento de objetos) y registrar únicamente en la base de datos PostgreSQL los metadatos y la URL/ruta de acceso mediante la entidad relacional `Attachment` (`filename`, `mimeType`, `fileSize`, `filePath`, `createdAt`)[cite: 3].

- **Estado (Status):** 
  Decidida[cite: 1, 2].

- **Grupo (Group):** 
  Datos / Almacenamiento[cite: 1, 2].

- **Supuestos (Assumptions):** 
  - El volumen de archivos inicial del MVP puede alojarse en un volumen persistente o carpeta montada en el servidor/contenedor[cite: 1, 2, 3].
  - La API REST ofrecerá endpoints `multipart/form-data` para la subida de ficheros con validación estricta de extensiones y tamaño máximo (ej. máx. 10 MB)[cite: 3].

- **Restricciones (Constraints):** 
  - Exige configurar un límite de tamaño de petición en Spring Boot (`spring.servlet.multipart.max-file-size`)[cite: 1].
  - Exige validar los tipos MIME de los archivos permitidos (`image/jpeg`, `image/png`, `video/mp4`)[cite: 3].

- **Posiciones (Positions):** 
  1. **Ficheros en sistema de archivos / metadatos en PostgreSQL (Seleccionada):** Optimiza el rendimiento de la base de datos y sigue las indicaciones del modelo de dominio[cite: 3].
  2. **Almacenamiento de BLOBs dentro de la base de datos PostgreSQL:** Incrementa drásticamente el tamaño de los backups y empeora el rendimiento de las consultas en la tabla `Incident`.

- **Argumento (Argument):** 
  El documento formal de UrbanPulse establece explícitamente en la descripción de la entidad `Attachment`: *"Fotografía o documento almacenado fuera de la base relacional y referenciado por metadatos"* (RF05)[cite: 3].

- **Implicaciones (Implications):** 
  - Creación de la entidad JPA `Attachment` (Issue #18)[cite: 1, 3].
  - El frontend React utilizará un componente de carga de archivos `input type="file"` (RF05)[cite: 1, 3].

- **Decisiones relacionadas (Related decisions):** 
  - *ADR-03:* Persistencia con PostgreSQL en Docker y Mapeo mediante JPA/Hibernate[cite: 1, 2, 3].

- **Requisitos relacionados (Related requirements):** 
  - **RF05:** Evidencias[cite: 3].
  - **RF13:** Colaboración y aportación de evidencias de resolución[cite: 3].

- **Artefactos relacionados (Related artifacts):** 
  - Entidad `Attachment` en `com.urbanpulse.model` (Issue #18)[cite: 1, 3].
  - Módulo de carga de archivos en el backend[cite: 1].

- **Principios relacionados (Related principles):** 
  - **Separación de datos relacionales y binarios:** Mantener las bases relacionales optimizadas para datos estructurados[cite: 3].

- **Notas (Notes):** 
  Relacionado con los trabajos de desarrollo JPA previstos en la Issue #18[cite: 1].