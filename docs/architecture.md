# 🏗️ Arquitectura del Sistema - UrbanPulse

## Visión General

UrbanPulse está diseñado como una **aplicación monolítica modular** basada en una arquitectura en capas (Layered Architecture). El sistema se divide en un Backend REST desarrollado en Java con Spring Boot, un Frontend Single Page Application (SPA) en React y una base de datos relacional PostgreSQL ejecutada en Docker Compose.

> **Nota sobre el alcance:** esta documentación describe la **versión inicial funcional (MVP)**. El backend y el frontend se ejecutan fuera de contenedores; solo PostgreSQL está contenerizada.

---

## Componentes Principales

| Componente | Tecnología | Responsabilidad |
|-|-|-|
| **Frontend Web** | React + Vite | Interfaz de usuario interactiva para ciudadanos, operadores, técnicos y analistas. |
| **API REST Backend** | Java 11 + Spring Boot | Exposición de endpoints REST, validaciones y lógica de negocio. |
| **Lógica de negocio** | Servicios (`*Service`) | Reglas de dominio: ciclo de vida de incidencias, asignaciones, evidencias, notificaciones y analítica. |
| **Capa de Persistencia** | Spring Data JPA / Hibernate | Mapeo objeto-relacional y consultas a la base de datos. |
| **Base de Datos** | PostgreSQL 16 | Persistencia relacional de usuarios, incidencias, asignaciones, adjuntos, notificaciones y roles. |
| **Seguridad** | Spring Security | Autenticación, autorización por rol, contraseñas con BCrypt, sesiones `HttpOnly` y protección CSRF. |
| **Documentación de la API** | springdoc-openapi (OpenAPI 3 / Swagger UI) | Genera y expone la especificación OpenAPI del contrato REST. |
| **Integraciones Externas** | Adapter Pattern | Comunicación resiliente con servicios de geolocalización y entorno urbano (clima, tráfico). |

---

## Estructura en capas del Backend

El backend sigue una separación clara por responsabilidades:

- **`controller`** — exponen los endpoints REST y delegan en los servicios.
- **`service`** — contienen la lógica de negocio y orquestan las operaciones.
- **`repository`** — acceden a la base de datos mediante Spring Data JPA.
- **`entity`** — entidades de persistencia del dominio (`Incident`, `User`, `Assignment`, `Attachment`, `StatusChange`, `Notification`, `UrbanAsset`, `UrbanContext`, `ExternalObservation`).
- **`dto`** — objetos de transferencia que desacoplan la API de las entidades.
- **`exception`** — manejo centralizado de errores mediante `@RestControllerAdvice` y el DTO `ApiError`.
- **`external`** — integraciones con fuentes externas mediante el patrón Adapter.

---

## Integraciones Externas

Las fuentes externas enriquecen cada incidencia con contexto urbano (geolocalización, clima y tráfico). En esta versión las integraciones están implementadas como **adaptadores mock** (`MockGeoLocationAdapter`, `MockTrafficAdapter`, `MockWeatherAdapter`), por lo que no dependen de servicios reales.

Siguen una **degradación controlada**: si una fuente externa falla o no está disponible, el registro y la consulta de la incidencia nunca se bloquean; se asignan valores de *fallback* documentados.

---

## Diagramas C4 y Decisiones de Arquitectura

- [**Diagramas de Arquitectura C4**](diagrama-C4/): vistas detalladas de Contexto (Nivel 1), Contenedores (Nivel 2) y Componentes (Nivel 3).
- [**Acuerdo y Diseño de API REST**](api/acuerdo-api.md): especificación de endpoints, códigos HTTP y estructura de respuesta.
- [**Registro de Decisiones de Arquitectura (ADRs)**](adr/)
