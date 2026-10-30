#  UrbanPulse

Plataforma inteligente para la gestión, seguimiento y resolución de incidencias en infraestructuras urbanas.

---

##  ¿Qué es UrbanPulse?
**UrbanPulse** es una solución integral diseñada para conectar a los ciudadanos con la administración pública municipal. Permite reportar desperfectos en la vía pública (calzadas, iluminación, mobiliario urbano), gestionarlos mediante flujos de trabajo validados y asignar tareas de mantenimiento a técnicos especializados en tiempo real.

---

##  Características Principales
* **Gestión de Incidencias**: Creación, consulta y seguimiento del ciclo de vida de reportes urbanos.
* **Geolocalización**: Ubicación de avisos en mapa con coordenadas.
* **Seguimiento de incidencias**: Búsqueda, filtros, paginación e historial de transiciones.
* **Evidencias**: Carga y descarga de imágenes y documentos asociados al reporte.
* **Asignaciones**: Flujo básico para asignar y cerrar trabajos municipales.
* **Tratamiento Resiliente de Errores**: Respuestas de API estandarizadas con trazabilidad mediante UUID.

> La autenticación y autorización por roles, y los módulos `UrbanAsset`, `ExternalObservation` y `UrbanContext`, todavía no están implementados. Las transiciones operativas no deben publicarse en producción hasta proteger la API con RBAC.

---

##  Tecnologías Utilizadas y Justificación

| Tecnología | Rol en el Proyecto | ¿Por qué se utiliza? |
| :--- | :--- | :--- |
| **Java 11 + Spring Boot 2.6** | Backend (API REST) | Marco robusto de grado empresarial que facilita la creación de APIs escalables, inyección de dependencias y Spring Data JPA. |
| **React + Vite** | Frontend (SPA) | Librería declarativa que permite crear interfaces de usuario dinámicas y reactivas con excelente rendimiento. |
| **PostgreSQL 16** | Base de Datos Relacional | Sistema Gestor de Base de Datos relacional, altamente fiable y óptimo para datos estructurados con soporte geográfico. |
| **Docker & Docker Compose** | Contenerización | Permite empaquetar y ejecutar la infraestructura (PostgreSQL, app) de forma idéntica en cualquier entorno (12-Factor App). |
| **GitHub Actions** | Integración Continua (CI) | Automatización del proceso de compilación y ejecución de tests (`mvn verify`) en cada Pull Request para asegurar la calidad. |

---

##  Documentación del Repositorio

*  **[Arquitectura del Sistema](docs/architecture.md)**: Estructura general, componentes y modelos C4.
*  **[Diseño de la API REST](docs/api/acuerdo-api.md)**: Contrato de endpoints, códigos HTTP y formato de errores.
*  **[Decisiones de Arquitectura (ADRs)](docs/adr/)**: Registro formal de decisiones técnicas (monorepo, SGBD, etc.).
*  **[Guía de Desarrollo Local](docs/development.md)**: Requisitos, instalación y ejecución de pruebas.
*  **[Guía de Despliegue](docs/deployment.md)**: Instrucciones para empaquetado y ejecución con Docker.
*  **[Guía de Contribución](CONTRIBUTING.md)**: Reglas para ramas, Conventional Commits y Pull Requests.

---

##  Equipo del Proyecto
* **Maintainer:** Ignacio José García García (Nacho)
* **Product Owner:** Iván Pedraza Díez
* **Tester:** Mario Merino Zapata
* **Reviewers:** Gregorio Merchan Merchan y Francisco Javier Santiburcio Vicente
* **Developers:** Todos los integrantes
