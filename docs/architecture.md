#  Arquitectura del Sistema - UrbanPulse

## Visión General

UrbanPulse está diseñado como una **aplicación monolítica modular** basada en una arquitectura en capas (Layered Architecture). El sistema se divide en un Backend REST desarrollado en Java con Spring Boot, un Frontend Single Page Application (SPA) en React y una base de datos relacional PostgreSQL orquestada con Docker.

\---

##  Componentes Principales

|Componente|Tecnología|Responsabilidad|
|-|-|-|
|**Frontend Web**|React + Vite|Interfaz de usuario interactiva para ciudadanos, operadores y técnicos.|
|**API REST Backend**|Java 11 + Spring Boot|Exposición de endpoints REST, lógica de negocio y validaciones.|
|**Capa de Persistencia**|Spring Data JPA / Hibernate|Mapeo objeto-relacional y consultas a la base de datos.|
|**Base de Datos**|PostgreSQL|Persistencia relacional de usuarios, incidencias, adjuntos y roles.|
|**Integraciones Externas**|Adapter / DTO Pattern|Comunicación resiliente con servicios de geolocalización y entorno urbano.|

\---

##  Diagramas C4 y Decisiones de Arquitectura

*  [**Diagramas de Arquitectura C4**](diagrama-C4/): Vistas detalladas de Contexto (Nivel 1), Contenedores (Nivel 2) y Componentes (Nivel 3).
*  [**Acuerdo y Diseño de API REST**](api/acuerdo-api.md): Especificación de endpoints, códigos HTTP y estructura de respuesta.
*  [**Registro de Decisiones de Arquitectura (ADRs)**](adr/)

