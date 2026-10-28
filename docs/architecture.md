#  Arquitectura del Sistema - UrbanPulse

## Visión General

UrbanPulse está diseñado como una **aplicación monolítica modular** basada en una arquitectura en capas (Layered Architecture)\[cite: 5]. El sistema se divide en un Backend REST desarrollado en Java con Spring Boot, un Frontend Single Page Application (SPA) en React y una base de datos relacional PostgreSQL orquestada con Docker\[cite: 5].

\---

##  Componentes Principales

|Componente|Tecnología|Responsabilidad|
|-|-|-|
|**Frontend Web**|React + Vite|Interfaz de usuario interactiva para ciudadanos, operadores y técnicos\[cite: 5].|
|**API REST Backend**|Java 11 + Spring Boot|Exposición de endpoints REST, lógica de negocio y validaciones\[cite: 5].|
|**Capa de Persistencia**|Spring Data JPA / Hibernate|Mapeo objeto-relacional y consultas a la base de datos\[cite: 5].|
|**Base de Datos**|PostgreSQL|Persistencia relacional de usuarios, incidencias, adjuntos y roles\[cite: 5].|
|**Integraciones Externas**|Adapter / DTO Pattern|Comunicación resiliente con servicios de geolocalización y entorno urbano\[cite: 5].|

\---

##  Diagramas C4 y Decisiones de Arquitectura

*  [**Diagramas de Arquitectura C4**](diagrama-C4/): Vistas detalladas de Contexto (Nivel 1), Contenedores (Nivel 2) y Componentes (Nivel 3)\[cite: 5].
*  [**Acuerdo y Diseño de API REST**](api/acuerdo-api.md): Especificación de endpoints, códigos HTTP y estructura de respuesta\[cite: 5].
*  [**Registro de Decisiones de Arquitectura (ADRs)**](adr/):

  * [ADR-001: Adopción de Arquitectura Monorepo](adr/001-adopcion-de-arquitectura-monorepo.md)\[cite: 5]
  * [ADR-002: Estrategia de Persistencia con Doble SGBD](adr/002-estrategia-de-persistencia-con-doble-sgbd.md)\[cite: 5]
  * [ADR-003: Compatibilidad con Java 11 y Spring Boot](adr/003-compatibilidad-con-java-11-y-spring-boot.md)\[cite: 5]
  * [ADR-004: Patrón Adapter y DTO para Servicios Externos](adr/004-patron-adapter-y-dto-para-servicios-externos.md)\[cite: 5]
  * [ADR-005: Manejo Centralizado de Excepciones](adr/005-manejo-centralizado-de-excepciones.md)\[cite: 5]

