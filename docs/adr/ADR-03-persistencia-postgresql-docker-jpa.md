# ADR-03: Persistencia con PostgreSQL en Docker y Mapeo mediante Spring Data JPA e Hibernate

- **Asunto (Issue):** 
  El sistema UrbanPulse requiere un mecanismo de persistencia relacional robusto para almacenar de forma estructurada y consistente el modelo del dominio (entidades como `Incident`, `User`, `Assignment`, `StatusChange`, etc.)[cite: 3].
  Debemos abordar esta decisión ahora para permitir que los desarrolladores de backend trabajen e integren entidades de forma agilizada mediante contenedores ligeros sin depender de instalaciones locales de bases de datos heterogéneas, garantizando al mismo tiempo que el esquema de la base de datos se genere y sincronice automáticamente con el modelo de objetos durante la fase de desarrollo del MVP[cite: 1, 2, 3].

- **Decisión (Decision):** 
  Utilizar **PostgreSQL** desplegado mediante contenedores **Docker** (a través de `docker-compose.yml`) como sistema de gestión de bases de datos relacionales (RDBMS) para el entorno de desarrollo y pruebas[cite: 1, 2, 3]. Para la capa de acceso a datos en la aplicación Spring Boot, se adopta **Spring Data JPA** con **Hibernate** como proveedor ORM (Object-Relational Mapping), delegando en Hibernate la creación y actualización automática de esquemas DDL (`ddl-auto` / `@Entity`)[cite: 1, 3].

- **Estado (Status):** 
  Decidida[cite: 1, 2].

- **Grupo (Group):** 
  Datos / Persistencia[cite: 1, 2].

- **Supuestos (Assumptions):** 
  - Todos los desarrolladores del equipo disponen del motor de Docker y Docker Compose instalados y operativos en sus máquinas de desarrollo[cite: 1, 2, 3].
  - La versión de PostgreSQL elegida es compatible con las características del modelo de datos y las pruebas automatizadas del proyecto[cite: 1, 3].
  - Durante el desarrollo del MVP, el auto-DDL de Hibernate simplifica la evolución rápida del modelo de datos de las entidades relacionales sin requerir scripts complejos de migración manual[cite: 1, 3].

- **Restricciones (Constraints):** 
  - Obliga a mantener actualizado un archivo `docker-compose.yml` en la raíz del proyecto para levantar el contenedor de la base de datos de manera uniforme (`docker compose up -d`)[cite: 1, 2].
  - Requiere incluir el driver JDBC de PostgreSQL (`org.postgresql:postgresql`) y las dependencias de Spring Data JPA en la configuración de Maven/Gradle del backend[cite: 1].
  - El uso de la generación automática de esquemas de Hibernate exige un modelado cuidadoso mediante anotaciones JPA (`@Entity`, `@Table`, `@Id`, `@Enumerated`, etc.) para evitar inconsistencias en las claves primarias o foráneas[cite: 1, 3].

- **Posiciones (Positions):** 
  1. **PostgreSQL en Docker + Spring Data JPA / Hibernate (Seleccionada):** Proporciona un entorno relacional portable, aislado e idéntico para todos los desarrolladores[cite: 1, 2, 3], automatizando la creación de tablas a partir del código Java[cite: 1, 3].
  2. **Base de datos en memoria (H2) + JPA:** Opción extremadamente ligera, pero diferiría del comportamiento y tipos de datos relacionales reales de producción, pudiendo ocultar fallos de compatibilidad en consultas o dialectos.
  3. **PostgreSQL instalado de forma nativa en cada host + SQL/Flyway manual:** Exige la instalación y configuración manual del servicio en cada sistema operativo, aumentando la fricción en el setup del equipo y la posibilidad de discrepancias de versión o configuración local.

- **Argumento (Argument):** 
  Se adopta esta combinación por las siguientes razones:
  - **Portabilidad y Rapidez de Entorno:** Permite desplegar el motor de persistencia en segundos mediante el comando `docker compose up -d`[cite: 2], eliminando el clásico problema de "funciona en mi máquina" entre los miembros del equipo[cite: 1, 2].
  - **Productividad en la fase MVP:** El mapeo mediante anotaciones JPA (`@Entity`) combinado con Hibernate elimina la necesidad de escribir y mantener scripts SQL DDL manuales para la creación de tablas en las etapas iniciales de prototipado[cite: 1, 3].
  - **Paralelismo en el desarrollo:** Permite que integrantes que trabajan en distintas entidades (`User` en issue `#19`, `Assignment` en issue `#20`) levanten y prueben sus repositorios JPA de forma independiente en su propio contenedor Docker local[cite: 1, 2].

- **Implicaciones (Implications):** 
  - Requiere documentar el procedimiento de arranque del servicio de base de datos en el `README.md` (`docker compose up -d`)[cite: 1, 2].
  - Es necesario configurar las variables de entorno para la conexión JDBC (`spring.datasource.url`, `username`, `password`) en `application.properties` / `.env.example`[cite: 1].
  - En etapas más avanzadas del proyecto hacia producción, se deberá desacoplar el auto-DDL de Hibernate y reemplazarlo por un gestor de migraciones controlado (como Flyway o Liquibase) para evitar la pérdida o alteración accidental de datos reales[cite: 3].

- **Decisiones relacionadas (Related decisions):** 
  - *ADR-01:* Selección de React para la Interfaz de Usuario Front-end[cite: 1, 2].
  - *ADR-02:* Uso de Spring Boot y API REST en el Backend[cite: 1, 2, 3].

- **Requisitos relacionados (Related requirements):** 
  - **RF01:** Identidad y acceso (persistencia de datos de cuenta y credenciales)[cite: 3].
  - **RF03:** Registrar incidencia (almacenamiento de reportes urbanos)[cite: 1, 3].
  - **RF06:** Consulta y seguimiento (historial de datos y estado)[cite: 3].
  - **RF12:** Ciclo de vida (persistencia de transiciones de estado)[cite: 3].
  - **RF18:** Auditoría (registro relacional de acciones y cambios de estado)[cite: 3].

- **Artefactos relacionados (Related artifacts):** 
  - Archivo `docker-compose.yml` en el repositorio base[cite: 1].
  - Módulo `backend/` (entidades en `com.urbanpulse.model` y repositorios `JpaRepository`)[cite: 1, 3].
  - Issues `#19` (*[Feat] Modelar entidad User y enumerado Role*) y `#20` (*[Feat] Entidad Assignment*)[cite: 1].

- **Principios relacionados (Related principles):** 
  - **Evolución guiada por arquitectura:** "Partiremos de un monolito sencillo con tecnologías como Spring Boot y PostgreSQL"[cite: 3].
  - **Simplicidad operativa:** "Se adopta la solución más sencilla que satisfaga los atributos de calidad medidos"[cite: 2, 3].

- **Notas (Notes):** 
  En las pruebas del backend con Java 11, se validó la comunicación entre Spring Boot y el contenedor PostgreSQL expuesto mediante Docker, comprobando la correcta creación automática de las tablas tras ejecutar la suite de tests del proyecto[cite: 1, 2].