# ADR-14: Aislamiento de la Suite de Tests del Backend en un Esquema PostgreSQL Propio

- **Asunto (Issue):** 
  Los tests `@SpringBootTest` de `backend/src/test/java/com/urbanpulse/controller/` no tenían configuración propia (no existía `src/test/resources/`), así que arrancaban con `application.properties` y escribían en la base de datos de desarrollo `urbanpulse`, esquema `public`.
  Cada `mvn test` dejaba incidencias persistentes («Semáforo averiado», «Bache peligroso Alameda», «Farola rota en Soho») que aparecían después en la pantalla «Explorar» y en la analítica. Además, el resultado de algunos tests dependía de los datos que el desarrollador tuviera en su base local.

- **Decisión (Decision):** 
  Crear un **perfil de Spring `test`** que conserva el mismo servidor PostgreSQL pero escribe en un **esquema propio, `urbanpulse_test`**, y deshacer las escrituras de los tests de MockMvc con **`@Transactional`**:
  - `backend/src/test/resources/application-test.properties` apunta el *datasource* a `jdbc:postgresql://localhost:5432/urbanpulse?currentSchema=urbanpulse_test` y fija `hibernate.default_schema=urbanpulse_test`. Ignora a propósito `DATABASE_URL`, para que los tests nunca usen una base compartida o remota.
  - `backend/src/test/resources/db/test-schema.sql` (`CREATE SCHEMA IF NOT EXISTS urbanpulse_test`) se ejecuta con `spring.sql.init.mode=always` antes de que Hibernate cree las tablas (`ddl-auto=update`). No hay que crear nada a mano.
  - Todas las clases `@SpringBootTest` declaran `@ActiveProfiles("test")` (`ActuatorK6ProfileTest` usa `{"test", "k6"}`).
  - `IncidentControllerTest` y `AssignmentControllerTest`, que crean incidencias y asignaciones, llevan `@Transactional`: cada test se revierte al terminar y el esquema de test solo conserva los datos semilla de `DatabaseDataLoader`.

- **Estado (Status):** 
  Decidida.

- **Grupo (Group):** 
  Calidad / Pruebas.

- **Supuestos (Assumptions):** 
  - Los tests siguen necesitando un PostgreSQL real: las consultas de búsqueda, duplicados y analítica se validan contra el mismo motor que en producción (ADR-03).
  - En local ya hay un PostgreSQL 16 levantado con `docker compose up -d`, y el CI levanta uno como servicio con la base `urbanpulse`.
  - Las peticiones de MockMvc se ejecutan en el mismo hilo que el test y ningún servicio usa `REQUIRES_NEW` ni `@Async`, así que todo participa en la transacción del test.

- **Restricciones (Constraints):** 
  - Java 11 y Spring Boot 2.6; sin dependencias nuevas.
  - El cambio no debe exigir pasos manuales nuevos a los desarrolladores ni cambios en `.github/workflows/ci.yml`.
  - La aplicación en ejecución no debe ver nunca datos generados por los tests.

- **Posiciones (Positions):** 
  1. **Esquema `urbanpulse_test` en la misma base + `@Transactional` en los tests que escriben (Seleccionada):** aislamiento completo respecto al esquema `public`, sin pasos manuales y sin tocar el CI.
  2. **Base de datos separada `urbanpulse_test`:** aislamiento equivalente, pero el controlador JDBC de PostgreSQL no crea bases de datos. Habría que añadir un script en `/docker-entrypoint-initdb.d` (solo se ejecuta con un volumen vacío, así que cada desarrollador tendría que ejecutar `createdb` a mano) y cambiar el servicio del CI. Descartada por esa fricción, a cambio de la misma protección.
  3. **Solo `@Transactional`, sobre la base de desarrollo:** evita las incidencias de prueba, pero los tests seguirían leyendo los datos locales del desarrollador, `DatabaseDataLoader` y `ddl-auto=update` seguirían actuando sobre `public`, y bastaría con olvidar la anotación en un test nuevo para volver a ensuciar la base. Insuficiente por sí sola.
  4. **Base embebida H2 o Testcontainers:** H2 no reproduce el dialecto de PostgreSQL. Testcontainers añade una dependencia y exige Docker disponible desde Maven en cada ejecución. Descartadas por desproporcionadas para el alcance actual.

- **Argumento (Argument):** 
  La opción 1 es el cambio más pequeño que separa de verdad los datos de test de los de desarrollo: es solo configuración, cumple 12-Factor (*dev/prod parity*: el mismo motor PostgreSQL en local, CI y producción) y funciona sin cambios en el CI, porque el esquema se crea solo dentro de la base `urbanpulse` del servicio. `@Transactional` complementa el esquema propio: cada test parte del mismo estado y el esquema de test no crece entre ejecuciones.

- **Implicaciones (Implications):** 
  - Tras `mvn test`, el esquema `public` de `urbanpulse` (el que usa la aplicación) no cambia.
  - Todo test `@SpringBootTest` nuevo **debe** declarar `@ActiveProfiles("test")`; sin él volvería a usar la base de desarrollo. Si además escribe datos, debe llevar `@Transactional`.
  - El esquema `urbanpulse_test` aparece en la base local (por ejemplo, en pgAdmin). Se puede borrar sin riesgo (`DROP SCHEMA urbanpulse_test CASCADE`); se recrea en la siguiente ejecución.
  - Con `@Transactional`, la serialización de la respuesta ocurre con la sesión de Hibernate abierta. Equivale al comportamiento en ejecución, porque `spring.jpa.open-in-view` está activo por defecto.

- **Decisiones relacionadas (Related decisions):** 
  - *ADR-03:* Persistencia en PostgreSQL con Docker y JPA.
  - *ADR-13:* Observabilidad local restringida al perfil `k6` (el test del perfil `k6` combina ambos perfiles).

- **Requisitos relacionados (Related requirements):** 
  - Los datos de prueba no deben contaminar la base de datos de desarrollo ni la pantalla «Explorar».

- **Artefactos relacionados (Related artifacts):** 
  - `backend/src/test/resources/application-test.properties` y `backend/src/test/resources/db/test-schema.sql`.
  - Clases de `backend/src/test/java/com/urbanpulse/controller/`.
  - `docs/development.md` (sección 3).

- **Principios relacionados (Related principles):** 
  - **12-Factor App:** configuración por entorno externalizada y paridad entre desarrollo y producción.
  - **Tests repetibles e independientes:** cada test parte de un estado conocido.
