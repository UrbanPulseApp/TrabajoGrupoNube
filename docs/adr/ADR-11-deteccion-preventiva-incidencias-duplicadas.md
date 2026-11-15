# ADR-11: Detección Preventiva de Incidencias Duplicadas con Prefiltrado por Bounding Box y Distancia Haversine

- **Asunto (Issue):** 
  Ante un problema visible (un semáforo averiado, un árbol caído), varios ciudadanos suelen reportar lo mismo en pocos minutos y a pocos metros. Los duplicados saturan la cola de los operadores y distorsionan la analítica territorial.
  Hay que avisar al ciudadano **antes** de enviar el reporte, con una consulta lo bastante rápida para lanzarla mientras elige el punto en el mapa, sin añadir infraestructura nueva.

- **Decisión (Decision):** 
  Exponer `GET /api/incidents/duplicates?latitude=&longitude=&category=&radiusMeters=` (público), implementado en `IncidentService#findDuplicates` en dos fases:
  1. **Prefiltrado en PostgreSQL por *bounding box*:** se calcula un rectángulo alrededor del punto (`Δlat = r / 111.000 m × 1,5`; `Δlon = r / (111.000 m × cos(lat)) × 1,5`, con un margen de seguridad de 1,5) y se consulta con una `Specification` JPA que filtra por `latitude BETWEEN` y `longitude BETWEEN`. Solo se tienen en cuenta los estados activos (`REPORTED`, `VALIDATED`, `ASSIGNED`, `IN_PROGRESS`) y, si llega, la categoría sin distinguir mayúsculas (`lower(category)`).
  2. **Cálculo exacto en Java con la fórmula de Haversine** (`calculateDistanceMeters`, radio terrestre de 6.371 km) sobre los candidatos. Se descartan los que superan el radio y se devuelven ordenados por distancia, con `distanceMeters` redondeado a decímetros.
  El radio por defecto es de 50 m. El formulario de reporte (`ReportPage.jsx`) consulta con 60 m y un *debounce* al mover el punto, y muestra los avisos cercanos en el mapa. El ciudadano decide si continúa: la API **no bloquea** la creación de la incidencia.
  El mismo patrón (bounding box + Haversine) se reutiliza en `findNearbyAssets` para el contexto urbano (100 m).

- **Estado (Status):** 
  Decidida e implementada.

- **Grupo (Group):** 
  Dominio / Consultas espaciales.

- **Supuestos (Assumptions):** 
  - Los radios de interés son pequeños (decenas o cientos de metros), así que la aproximación esférica de Haversine es más que suficiente frente a un cálculo geodésico.
  - El número de incidencias activas dentro de un rectángulo de ~150 m es pequeño, por lo que filtrar en memoria es barato.

- **Restricciones (Constraints):** 
  - No se quiere depender de extensiones de PostgreSQL (PostGIS) ni de motores de búsqueda externos en esta fase (principio de evolución incremental).
  - La detección es **orientativa**: el criterio final de duplicado lo aplica el operador (*Human-in-the-Loop*), que puede rechazar la incidencia con motivo.

- **Posiciones (Positions):** 
  1. **Bounding box en SQL + Haversine en Java (Seleccionada):** Sin dependencias nuevas, portable y suficientemente preciso.
  2. **PostGIS (`geography`, `ST_DWithin` e índice GiST):** Más eficiente con grandes volúmenes y con radios variables, pero añade una extensión a la imagen de base de datos y cambia el modelo de columnas. Pospuesta hasta que el volumen lo justifique.
  3. **Haversine completo en SQL sobre toda la tabla:** Una sola consulta, pero sin prefiltrado no puede usar índices y recorre todas las filas. Rechazada.
  4. **Bloquear la creación si hay un duplicado:** Evita duplicados, pero genera falsos positivos (dos problemas distintos en la misma esquina) y frustra al ciudadano. Rechazada.

- **Argumento (Argument):** 
  El prefiltrado reduce el conjunto a unos pocos candidatos con una consulta simple sobre columnas numéricas, y Haversine da la distancia real en metros que el frontend necesita mostrar. La solución cumple el objetivo de usabilidad sin introducir infraestructura que hoy no hace falta.

- **Implicaciones (Implications):** 
  - El endpoint es público (`SecurityConfiguration`), porque se usa durante el reporte y solo devuelve DTOs públicos de incidencias.
  - A gran volumen convendría un índice compuesto sobre `(latitude, longitude)` o migrar a PostGIS (posición 2); las pruebas de carga del experimento 1 de k6 miden su latencia.
  - Cualquier otra consulta de proximidad debe reutilizar `calculateDistanceMeters` y el mismo cálculo de bounding box.

- **Decisiones relacionadas (Related decisions):** 
  - *ADR-05:* Máquina de estados del ciclo de vida de incidencias (estados activos).
  - *ADR-08:* Paginación en servidor y filtros de búsqueda para mapas.

- **Requisitos relacionados (Related requirements):** 
  - **RF16:** Detección de incidencias duplicadas.
  - **RF21:** Contexto urbano (activos cercanos con el mismo cálculo espacial).

- **Artefactos relacionados (Related artifacts):** 
  - `IncidentService#findDuplicates`, `IncidentService#findNearbyAssets` y `IncidentService#calculateDistanceMeters`.
  - `IncidentController` (`GET /api/incidents/duplicates`).
  - `frontend/src/services/IncidentService.js` (`findDuplicateIncidents`) y `frontend/src/pages/ReportPage.jsx`.
  - `docs/api/acuerdo-api.md` (sección de duplicados y campo `distanceMeters`).

- **Principios relacionados (Related principles):** 
  - **Evolución incremental:** no incorporar infraestructura (PostGIS) sin un problema observable.
  - **Human-in-the-Loop:** el sistema sugiere y la persona decide.

- **Notas (Notes):** 
  Registrado en la Issue #54.
