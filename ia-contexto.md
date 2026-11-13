# Contexto Técnico y Arquitectónico del Proyecto — UrbanPulse (`ia-contexto.md` / `CLAUDE.md`)

> **Propósito:** Proveer a cualquier asistente de Inteligencia Artificial (Claude, GitHub Copilot, Gemini) o desarrollador del equipo una referencia permanente sobre la arquitectura, el dominio, las invariantes técnicas, el flujo de trabajo y las pautas evolutivas de **UrbanPulse**. Este documento está redactado para mantenerse vigente a lo largo de todas las iteraciones del proyecto.

---

## 1. Visión del Proyecto y Principios Rectores

* **Proyecto:** **UrbanPulse** — Plataforma cloud para la gestión inteligente de incidencias urbanas en la ciudad de Málaga.
* **Contexto Académico:** Asignatura *Desarrollo de Software en Plataformas en la Nube* (E.T.S. Ingeniería Informática — Universidad de Málaga, Prof. Eduardo Guzmán de los Riscos).
* **Propósito del Dominio:** Transformar un reporte ciudadano aislado (semáforo averiado, bache, farola apagada, árbol caído, mobiliario dañado) en una unidad de trabajo enriquecida con contexto urbano (barrio, distrito, activos municipales cercanos, tráfico, meteorología), trazable mediante auditoría de estados y susceptible de análisis territorial y documental.
* **Principios Arquitectónicos Inmutables:**
  1. **La incidencia (`Incident`) es el centro del dominio** y mantiene un ciclo de vida estrictamente auditable (`StatusChange`).
  2. **Degradación controlada (Resiliencia):** Las fuentes externas enriquecen la incidencia (`UrbanContext`, `UrbanAsset`, `ExternalObservation`), pero **nunca bloquean** su creación ni la disponibilidad del sistema si un proveedor externo falla o sufre *timeout* (se aplican valores de reserva/*fallback*).
  3. **Evolución incremental (Monolito Modular + 12-Factor App):** El núcleo parte de un monolito modular limpio (**Spring Boot + PostgreSQL + React**) con configuración externalizada por entorno. Solo se incorporan nuevos componentes de infraestructura (colas, motores de búsqueda vectorial/RAG, servicios independientes) cuando existe un problema observable, una hipótesis comprobable y un **ADR** documentado.
  4. **Human-in-the-Loop:** Las capacidades analíticas, predictivas o asistidas por IA apoyan la clasificación, priorización y consulta, sin sustituir la decisión humana en actuaciones municipales sensibles.
  5. **Design-First y Repo-as-Context:** Toda evolución en endpoints, modelos o arquitectura debe mantenerse sincronizada entre el código fuente, el contrato REST (`docs/api/acuerdo-api.md`), la arquitectura (`docs/architecture.md`), los diagramas C4 (`docs/diagrama-C4/`) y los registros de decisiones (`docs/adr/`).

---

## 2. Equipo y Gobernanza en GitHub

* **Repositorio Oficial:** `https://github.com/UrbanPulseApp/TrabajoGrupoNube`
* **Roles del Equipo:**
  * **Maintainer / Arquitectura:** Ignacio José García García (`NachoGarcia15`)
  * **Product Owner:** Iván Pedraza Díez
  * **Reviewers:** Gregorio Merchán Merchán (`GregorioMerchan`) y Francisco Javier Santiburcio Vicente (`JavierSantiburcio`)
  * **Tester:** Mario Merino Zapata
  * **Developers:** Todos los integrantes

### Flujo de Trabajo y Convenciones (GitHub Flow)

1. **Rama principal (`main`):** Siempre estable, compilable y protegida. No se realizan commits directos; todo cambio entra vía Pull Request revisada por al menos un Reviewer.
2. **Nomenclatura de ramas (creadas siempre desde `main`):**
   * `feature/<descripcion-corta>` — Nuevas funcionalidades.
   * `fix/<descripcion-corta>` — Corrección de errores.
   * `docs/<descripcion-corta>` — Cambios en documentación, contratos y ADRs.
   * `refactor/<descripcion-corta>` — Reestructuración interna sin cambio funcional.
   * `chore/<descripcion-corta>` — Configuración, dependencias, semillas de datos y CI/CD.
3. **Conventional Commits (Obligatorio):**
   * `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`, `test: ...`, `chore: ...`
4. **Plantillas Oficiales del Repositorio:**
   * **Issues (`.github/ISSUE_TEMPLATE/issue-general.md`):** Título con prefijo (`[Feat]`, `[Fix]`, `[Docs]`, `[Chore]`), historia de usuario (*Como [Rol], debo [propósito], para que [beneficio] (RFXX)*), Tareas de Desarrollo, Requisitos RFXX y Definition of Done (DoD).
   * **Pull Requests (`.github/PULL_REQUEST_TEMPLATE.md`):** Descripción del cambio, checkboxes de tipo de cambio, vinculación `Closes #<numero_issue>` y verificación de compilación, tests y seguridad.
5. **Integración Continua (`.github/workflows/ci.yml`):** Valida automáticamente la compilación y suite de pruebas en cada Pull Request hacia `main`.

---

## 3. Stack Tecnológico y Organización del Monorepo

### Stack Tecnológico

* **Backend:** Java 11, Spring Boot 2.6, Spring Web, Spring Data JPA (Hibernate), Spring Security, SpringDoc OpenAPI (`/swagger-ui.html`), Jackson.
* **Frontend:** React, Vite (Node 20 recomendado en `.nvmrc`), React Leaflet (mapas interactivos centrados en Málaga), CSS modularizado por componente/vista con soporte de temas (`theme.css`, `ui.css`).
* **Base de Datos:** PostgreSQL 16 (orquestada en desarrollo local mediante `docker-compose.yml`).
* **Configuración 12-Factor App:** Variables de entorno definidas en `.env` (ignorado en `.gitignore` junto con el directorio local de adjuntos) a partir de `.env.example`.

### Organización Estructural del Repositorio

    TrabajoGrupoNube/
    ├── .env.example                 # Plantilla de variables de entorno (PORT, DATABASE_URL, credenciales BD)
    ├── .gitignore                   # Excluye target/, node_modules/, .env, backend/uploads/, .idea/
    ├── CONTRIBUTING.md              # Reglas de ramas, Conventional Commits y Pull Requests
    ├── README.md                    # Visión general, stack, guía de arranque y equipo
    ├── ia-contexto.md               # Documento maestro de contexto para IAs y desarrolladores
    ├── docker-compose.yml           # Orquestación local de PostgreSQL 16
    ├── .github/
    │   ├── ISSUE_TEMPLATE/issue-general.md
    │   ├── PULL_REQUEST_TEMPLATE.md
    │   └── workflows/ci.yml
    ├── docs/
    │   ├── architecture.md          # Arquitectura monolítica modular y tabla de componentes
    │   ├── development.md           # Guía de instalación y ejecución en desarrollo local
    │   ├── deployment.md            # Guía de empaquetado y despliegue con Docker
    │   ├── api/acuerdo-api.md       # Contrato REST oficial (Design-First)
    │   ├── adr/                     # Registros de Decisiones de Arquitectura (numeración secuencial)
    │   └── diagrama-C4/             # Diagramas C4 (.drawio y .png) niveles 1, 2 y 3
    ├── backend/
    │   ├── pom.xml
    │   └── src/
    │       ├── main/java/com/urbanpulse/
    │       │   ├── UrbanPulseApplication.java
    │       │   ├── config/          # Seguridad, PasswordEncoder, BootstrapAdmin y DatabaseDataLoader
    │       │   ├── controller/      # Controladores REST organizados por recurso
    │       │   ├── dto/             # Objetos de transferencia (*Request / *Response / ApiError)
    │       │   ├── entity/          # Entidades persistentes JPA (@Entity)
    │       │   ├── enums/           # Enumerados de dominio (Role, IncidentStatus, AssignmentStatus)
    │       │   ├── exception/       # GlobalExceptionHandler y excepciones de negocio
    │       │   ├── external/        # Patrón Adapter + servicios de contexto urbano y mocks resilientes
    │       │   ├── mapper/          # Conversores explícitos entre entidades y DTOs
    │       │   ├── repository/      # Repositorios Spring Data JPA y JpaSpecificationExecutor
    │       │   └── service/         # Lógica de negocio, reglas de transición y transacciones
    │       ├── main/resources/
    │       │   ├── application.properties
    │       │   └── data/            # Datasets iniciales (initial-data.json) y datos abiertos municipales (gecor/)
    │       └── test/java/com/urbanpulse/ # Suite de pruebas unitarias y de integración (MockMvc + Security)
    └── frontend/
        ├── .nvmrc
        ├── index.html
        ├── package.json
        ├── vite.config.js
        └── src/
            ├── App.jsx
            ├── main.jsx
            ├── components/
            │   ├── incidents/       # Tarjetas, vista previa, contexto urbano, galería, timeline, stepper y operaciones
            │   ├── layout/          # AppShell, selector de tema y menú de usuario
            │   ├── map/             # Superficie Leaflet, capas de incidencias, capa histórica y selector de coordenadas
            │   └── ui/              # Componentes base reutilizables (badges, pills, estados, iconos)
            ├── context/             # AuthContext, ThemeContext, ToastContext
            ├── lib/                 # Metadatos de categorías/estados y utilidades de UI
            ├── pages/               # Vistas principales (Exploración, Reporte, Detalle, Histórico, Analítica, Login)
            ├── services/            # Cliente HTTP centralizado (ApiClient.js) y servicios de dominio
            └── styles/              # Tokens de diseño y temas (theme.css, ui.css)

---

## 4. Arquitectura Backend y Reglas de Implementación (Java / Spring Boot)

### A. Modelo de Dominio e Identificadores

* **Estandarización UUID:** Todas las entidades principales y DTOs utilizan identificadores opacos de tipo `UUID` para evitar vulnerabilidades **IDOR** (*Insecure Direct Object Reference*) y garantizar consistencia en toda la API.
* **Entidades Centrales del Dominio:**
  * `Incident`: Núcleo del sistema con título, descripción, categoría, prioridad, estado (`IncidentStatus`), coordenadas (`latitude`, `longitude`), dirección, precisión, reportero y marcas temporales.
  * `User`: Ciudadanos y personal municipal con email único, contraseña encriptada (`BCrypt`), nombre, rol (`Role`), estado activo y fecha de alta.
  * `StatusChange`: Registro histórico inmutable de cada transición de estado de una incidencia, incluyendo actor, motivo (`reason`) y marca temporal.
  * `Assignment`: Vinculación operativa temporal entre una incidencia y un departamento, equipo o técnico (`AssignmentStatus`), con notas de seguimiento.
  * `Attachment`: Metadatos de evidencias (fotografías/documentos) almacenadas fuera de la base relacional en disco (`backend/uploads/`, configurable) con nombres basados en UUID.
  * `UrbanContext`, `UrbanAsset` y `ExternalObservation`: Información contextual georreferenciada de Málaga (barrio, distrito, mobiliario/infraestructura cercana, meteorología y tráfico).
  * `Notification`: Avisos dirigidos a usuarios (`recipientId`) derivados de eventos relevantes del ciclo de vida.

### B. Máquina de Estados e Invariantes de Negocio

* **Transiciones Permitidas (`IncidentStatus`):**
  * `REPORTED` -> `VALIDATED` | `REJECTED` (exige motivo `reason` obligatorio)
  * `VALIDATED` -> `ASSIGNED` | `REJECTED` (exige motivo `reason` obligatorio)
  * `ASSIGNED` -> `IN_PROGRESS`
  * `IN_PROGRESS` -> `RESOLVED`
  * `RESOLVED` -> `CLOSED` | `REOPENED`
  * `REOPENED` -> `ASSIGNED`
* **Invariantes Operativas:**
  * **Asignaciones:** Solo se admite **una asignación activa simultánea** por incidencia, y únicamente cuando la incidencia se encuentra en estado `VALIDATED` o `REOPENED`. Tanto operadores/administradores como el técnico asignado (`TECHNICIAN`) pueden actualizar el progreso y las notas técnicas mediante `PATCH /api/incidents/{incidentId}/assignments/{assignmentId}`.
  * **Evidencias (`Attachment`):** Validación estricta de tipos MIME permitidos (`JPEG`, `PNG`, `WEBP`, `PDF`), tamaño máximo por archivo (10 MB) y límite máximo de archivos por incidencia (4), protegiendo el almacenamiento frente a *path traversal*.
  * **Cálculo Espacial:** Las consultas de proximidad (vinculación de `UrbanAsset` cercanos y detección preventiva de duplicados en `/api/incidents/duplicates`) aplican prefiltrado por *bounding box* seguido de cálculo métrico mediante la fórmula de **Haversine**.
  * **Datos Abiertos Históricos:** Ingesta local desde `backend/src/main/resources/data/gecor/` (coordenadas WGS84 EPSG:4326 con `LONGITUD` y `LATITUD`) para visualización y análisis histórico sin depender de disponibilidad de red externa.

### C. Seguridad, RBAC y Manejo Global de Errores

* **Roles (`com.urbanpulse.enums.Role`):** `CITIZEN`, `OPERATOR`, `TECHNICIAN`, `ADMIN`, `ANALYST`.
* **Autenticación y Sesión:** Basada en cookies HTTP gestionadas por Spring Security (`AuthController`: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`). Los endpoints de autenticación JSON ignoran la verificación CSRF para evitar bloqueos 403 en las transiciones de sesión de la SPA React.
* **Desacoplamiento de Beans:** El bean `PasswordEncoder` (`BCryptPasswordEncoder`) reside en `PasswordConfig.java` para prevenir dependencias circulares entre `SecurityConfiguration` y `UserService`.
* **Separación Estricta DTO vs. Entidad:** Ningún controlador puede recibir o devolver entidades JPA directamente; toda entrada/salida pasa por DTOs explícitos (`*Request` / `*Response`).
* **Trazabilidad de Errores (`GlobalExceptionHandler`):** Toda excepción controlada o de validación devuelve el DTO `ApiError` estandarizado e inyecta la cabecera HTTP `X-Request-ID` con un UUID único.

---

## 5. Arquitectura Frontend (React + Vite)

* **Gestión de Estado Global (`frontend/src/context/`):**
  * `AuthContext.jsx`: Sesión activa, rol del usuario y renderizado condicional según permisos.
  * `ThemeContext.jsx`: Alternancia de tema claro/oscuro (`ThemeToggle.jsx` + `theme.css`).
  * `ToastContext.jsx`: Sistema de notificaciones visuales en interfaz.
* **Patrones de Interfaz y Red:**
  * **Capa HTTP Unificada (`frontend/src/services/`):** Todas las peticiones al backend pasan por `ApiClient.js` y los servicios de dominio (`AuthService.js`, `IncidentService.js`), enviando siempre `credentials: 'include'` y parseando errores `ApiError`.
  * **Prevención de Condiciones de Carrera:** Las vistas de listado y filtrado dinámico (`ExplorePage.jsx`) cancelan peticiones en vuelo obsoletas mediante `AbortController`.
  * **Flujos Clave de Usuario:** Exploración sobre mapa de Málaga (`MapSurface.jsx`), reporte geolocalizado con detección preventiva de duplicados en tiempo real y subida en dos fases (`ReportPage.jsx` + `PickerMap.jsx`), gestión operativa adaptada al rol (`IncidentDetailPage.jsx` + `IncidentOperations.jsx`), consulta de histórico abierto (`HistoricPage.jsx`) y analítica territorial (`AnalyticsPage.jsx`).

---

## 6. Ejecución y Verificación en Desarrollo Local

1. **Levantar PostgreSQL 16 con Docker Compose:**

        docker compose up -d

2. **Arrancar el Backend (Spring Boot en `http://localhost:8080`, Swagger UI en `/swagger-ui.html`):**

        cd backend
        mvn spring-boot:run

3. **Arrancar el Frontend (Vite en `http://localhost:5173`):**

        cd frontend
        npm install
        npm run dev

4. **Ejecutar la suite de pruebas antes de abrir Pull Request:**

        cd backend
        mvn clean verify

---

## 7. Pautas para la Evolución Futura del Sistema

Al incorporar nuevas capacidades en siguientes fases del proyecto (como notificaciones activas en tiempo real, gestión documental normativa `KnowledgeDocument`, asistencia inteligente / RAG, o modelos predictivos de correlación histórica y *hotspots*), se deben respetar estas directrices:

1. **Documentar antes o en paralelo:** Crear un nuevo registro secuencial en `docs/adr/` justificando la decisión arquitectónica, actualizar `docs/api/acuerdo-api.md` y sincronizar los diagramas C4 si aparecen nuevos contenedores o componentes significativos.
2. **Mantener la resiliencia (RF26):** Cualquier integración con modelos de IA, motores vectoriales o APIs externas debe ejecutarse con aislamiento de fallos (`try-catch`, *timeouts* acotados y *fallbacks*) para no degradar nunca el flujo principal de incidencias.
3. **Preservar la simplicidad modular:** Reutilizar el paquete `com.urbanpulse.external` (patrón Adapter) y las entidades/servicios existentes antes de introducir infraestructura distribuida compleja.

---

## 8. Reglas Directas para Asistentes de IA

1. **Respeta las convenciones del código existente:** Mantén la jerarquía de paquetes `com.urbanpulse.*`, no introduzcas Lombok (las entidades y DTOs usan constructores, getters y setters explícitos) y conserva `UUID` en todas las entidades y contratos.
2. **Seguridad y permisos coherentes:** Cualquier nuevo endpoint o cambio de permisos debe reflejarse simultáneamente en `SecurityConfiguration.java` (backend) y en los controles de visibilidad por rol en React (frontend).
3. **Sincronización Full-Stack:** Si modificas un DTO, entidad o ruta REST en Spring Boot, actualiza en la misma intervención el servicio correspondiente en `frontend/src/services/`, los componentes afectados y `docs/api/acuerdo-api.md`.
4. **Cobertura de pruebas:** Acompaña los cambios en lógica de negocio o seguridad del backend con tests en `backend/src/test/java/com/urbanpulse/` usando `MockMvc` y `@WithMockUser`.
5. **Idioma y estilo:** Responde siempre en español; escribe el código, nombres de clases, variables y métodos en inglés, y redacta los mensajes de commit siguiendo **Conventional Commits** (`feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`, `test: ...`, `chore: ...`).
