# 🏙️ UrbanPulse

Plataforma inteligente para la gestión, seguimiento y resolución de incidencias en infraestructuras urbanas.

[![CI: Java con Maven](https://github.com/UrbanPulseApp/TrabajoGrupoNube/actions/workflows/ci.yml/badge.svg)](https://github.com/UrbanPulseApp/TrabajoGrupoNube/actions/workflows/ci.yml)

---

## ¿Qué es UrbanPulse?

**UrbanPulse** es una solución integral diseñada para conectar a los ciudadanos con la administración pública municipal. Permite reportar desperfectos en la vía pública (calzadas, iluminación, mobiliario urbano), gestionarlos mediante flujos de trabajo validados y asignar tareas de mantenimiento a técnicos especializados en tiempo real.

La plataforma enriquece cada reporte con contexto urbano de la ciudad de Málaga (barrio, distrito, clima, tráfico y activos físicos cercanos), aplicando una estrategia de **degradación controlada**: si una fuente externa falla, el registro y la consulta nunca se bloquean.

---

## Estado del proyecto y alcance

Este repositorio contiene la **versión inicial funcional (MVP)** de UrbanPulse. Cubre el flujo completo de registro de incidencias, enriquecimiento con contexto urbano, seguimiento del ciclo de vida, asignaciones, evidencias, analítica básica y notificaciones.

Queda **fuera del alcance** de esta versión (visión futura del producto, no implementada):

- **Asistencia inteligente y RAG** (RF20): clasificación, priorización, resumen y recomendación basada en normativa mediante *Generación Aumentada por Recuperación*.
- **Modelos predictivos, detección de *hotspots* y correlación histórica** (RF17, RF25).
- **Informes exportables y análisis zonal avanzado** (RF19).
- **Recuperación de contraseña y verificación de correo**.

La arquitectura parte de un **monolito sencillo** y solo se incorporarán nuevos componentes ante un problema observable y una decisión arquitectónica documentada.

---

## Características principales

- **Gestión de incidencias**: creación, consulta y seguimiento completo del ciclo de vida, modelado como una **máquina de estados** (`REPORTED → VALIDATED → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED`, con `REJECTED` y `REOPENED`), con historial auditado de transiciones.
- **Geolocalización**: ubicación de avisos en mapa con coordenadas, barrio y distrito.
- **Mapa histórico de Málaga**: visualiza incidencias municipales resueltas publicadas por GECOR en Open Data Málaga (desde 2020 por defecto), con filtros por año, categoría y texto.
- **Búsqueda, filtros, ordenación y paginación**: por estado, categoría, texto libre y rango de fechas, con paginación en servidor para evitar sobrecargar el cliente.
- **Detección de duplicados**: identificación de posibles incidencias repetidas por proximidad geográfica y categoría.
- **Evidencias**: carga y descarga de imágenes y documentos (JPG/PNG/WEBP/PDF, hasta 10 MB y 4 por incidencia), almacenados fuera de la base de datos relacional.
- **Asignaciones**: flujo para asignar y cerrar trabajos municipales a departamentos y técnicos.
- **Contexto urbano enriquecido**: geocodificación, variables ambientales (clima) y estado del tráfico, con *fallbacks* documentados ante indisponibilidad.
- **Cuentas y permisos**: registro ciudadano, inicio/cierre de sesión y autorización por rol (`CITIZEN`, `OPERATOR`, `TECHNICIAN`, `ADMIN`, `ANALYST`).
- **Analítica**: indicadores y métricas territoriales para operadores, administradores y analistas.
- **Notificaciones**: avisos asociados a la operación municipal.
- **Tratamiento resiliente de errores**: respuestas de API estandarizadas (`ApiError`) con trazabilidad mediante UUID (`requestId`), sin exponer trazas internas.

---

## Tecnologías utilizadas y para qué

| Tecnología | Para qué se utiliza |
| :--- | :--- |
| **Java 11 + Spring Boot 2.6** | Backend (API REST): expone los endpoints y aloja la lógica de negocio, validaciones y seguridad. |
| **Spring Data JPA / Hibernate** | Capa de persistencia: mapea el modelo de dominio y ejecuta las consultas sobre PostgreSQL. |
| **Spring Security** | Autenticación, autorización por roles, contraseñas con BCrypt, sesiones `HttpOnly` y protección CSRF. |
| **springdoc-openapi (OpenAPI 3 / Swagger UI)** | Genera y expone la especificación OpenAPI del contrato REST. |
| **React + Vite** | Frontend (SPA): interfaz de usuario para ciudadanos, operadores y técnicos. |
| **Leaflet + react-leaflet** | Visualización interactiva de incidencias y capas urbanas sobre el mapa. |
| **Open Data Málaga (GECOR)** | Histórico anual de incidencias resueltas con coordenadas EPSG:4326; se consulta desde el backend y se muestra separado del flujo operativo de UrbanPulse. |
| **PostgreSQL 16** | Base de datos relacional: persistencia de usuarios, incidencias, asignaciones y adjuntos. |
| **Docker & Docker Compose** | Levanta la infraestructura (PostgreSQL) de forma reproducible en cualquier entorno. |
| **GitHub Actions** | Integración continua (CI): compila y ejecuta las pruebas en cada Pull Request. |

---

## Arquitectura

UrbanPulse se diseña como una **aplicación monolítica modular** en capas (*controller → service → repository*), con un Backend REST en Spring Boot, un Frontend SPA en React y una base de datos PostgreSQL orquestada con Docker.

La arquitectura se documenta siguiendo el modelo **C4** (Contexto, Contenedores, Componentes) y las decisiones relevantes se registran como **ADR** (*Architecture Decision Records*). Consulta [docs/architecture.md](docs/architecture.md) y la carpeta [docs/adr/](docs/adr/).

---

## Diseño de la API REST

La API sigue una estrategia **design-first**: rutas centradas en recursos en plural (`/api/incidents`, `/api/users`), uso de métodos HTTP semánticos (`GET`, `POST`, `PATCH`), DTOs separados de las entidades de persistencia, códigos de estado HTTP correctos y un formato de error unificado (`ApiError`).

El contrato completo de endpoints, permisos y códigos de error está en [docs/api/acuerdo-api.md](docs/api/acuerdo-api.md).

---

## Principios y buenas prácticas aplicadas

El desarrollo sigue las recomendaciones de **Twelve-Factor App** y las guías de diseño de APIs REST:

- **Configuración fuera del código**: los secretos y parámetros por entorno viven en variables de entorno (`.env`), nunca en el código fuente. Se versiona `.env.example`, no `.env`.
- **Dependencias explícitas**: todas las dependencias se declaran en `pom.xml` (Maven) y `package.json` (npm).
- **Servicios externos como recursos conectados**: la base de datos se configura mediante URL de conexión intercambiable (`DATABASE_URL`).
- **Autenticación por sesión**: la aplicación usa sesión web (`HttpSessionSecurityContextRepository`); la cookie `HttpOnly` transporta el identificador de sesión, cuyo estado se conserva en el servidor.
- **Build, release, run separados**: la construcción y las pruebas se ejecutan en CI (GitHub Actions), no "a mano" en el servidor.
- **Diseño REST**: recursos en plural, DTOs, errores estandarizados y paginación/filtrado/ordenación.
- **Colaboración**: GitHub Flow con ramas `feature/`, `fix/`, `docs/`, `chore/` y *Conventional Commits* (ver [CONTRIBUTING.md](CONTRIBUTING.md)).

---

## Puesta en marcha (resumen)

Requisitos: Java 11, Maven 3.8+, Node.js 18+, Docker y Git.

```bash
# 1. Clonar el repositorio
git clone https://github.com/UrbanPulseApp/TrabajoGrupoNube.git
cd TrabajoGrupoNube

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Iniciar PostgreSQL
docker compose up -d postgres

# 4. Ejecutar el backend (http://localhost:8080)
cd backend
mvn spring-boot:run

# 5. Ejecutar el frontend (http://localhost:5173/login)
cd ../frontend
npm install
npm run dev
```

La configuración detallada de variables de entorno, la creación del administrador inicial, las pruebas y el despliegue están en [docs/development.md](docs/development.md) y [docs/deployment.md](docs/deployment.md).

---

## Cómo contribuir

Revisa [CONTRIBUTING.md](CONTRIBUTING.md) para las reglas de ramas, *Conventional Commits* y *Pull Requests*.

---

## Documentación del repositorio

- [Arquitectura del Sistema](docs/architecture.md): estructura general, componentes y modelo C4.
- [Diseño de la API REST](docs/api/acuerdo-api.md): contrato de endpoints, códigos HTTP y formato de errores.
- [Decisiones de Arquitectura (ADRs)](docs/adr/): registro formal de decisiones técnicas.
- [Guía de Desarrollo Local](docs/development.md): requisitos, instalación y ejecución de pruebas.
- [Guía de Despliegue](docs/deployment.md): empaquetado y ejecución con Docker.

---

## Equipo del proyecto

- **Maintainer:** Ignacio José García García (Nacho)
- **Product Owner:** Iván Pedraza Díez
- **Tester:** Mario Merino Zapata
- **Reviewers:** Gregorio Merchan Merchan y Francisco Javier Santiburcio Vicente
- **Developers:** Todos los integrantes
