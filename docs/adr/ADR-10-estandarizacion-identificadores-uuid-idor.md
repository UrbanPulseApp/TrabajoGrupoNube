# ADR-10: Estandarización de Identificadores UUID en Todas las Entidades para Prevenir IDOR

- **Asunto (Issue):** 
  `Incident`, `Assignment`, `Attachment`, `StatusChange` y las entidades de contexto urbano ya usaban `UUID`, pero `User` y `Notification` (y sus DTOs y repositorios) seguían con identificadores numéricos secuenciales (`Long`).
  Un identificador secuencial expuesto en la API (`/api/users/{id}`, `recipientId` de las notificaciones) permite enumerar recursos y facilita ataques **IDOR** (*Insecure Direct Object Reference*): basta con probar `id+1`. Además, mezclar tipos de identificador complicaba el contrato REST y el frontend.

- **Decisión (Decision):** 
  Usar **`UUID` como clave primaria opaca en todas las entidades principales** y en todos los DTOs y rutas de la API. `User` y `Notification` se migran de `Long` a `UUID` (commit `abfd453`): entidad, `UserRepository` / `NotificationRepository`, `UserResponse`, `NotificationResponse`, `CreateNotification` (`recipientId`), `NotificationController` y `NotificationService`. Los identificadores los genera JPA con `@GeneratedValue(strategy = GenerationType.AUTO)`, que con Hibernate y un campo `UUID` produce UUID aleatorios (versión 4).

- **Estado (Status):** 
  Decidida e implementada.

- **Grupo (Group):** 
  Seguridad / Modelo de datos.

- **Supuestos (Assumptions):** 
  - Ningún cliente necesita deducir el orden de creación a partir del identificador; para eso se usa `createdAt`.
  - El volumen de datos del proyecto no hace que el tamaño de la clave (16 bytes frente a 8) o la peor localidad de los índices B-tree con UUID aleatorios sean un problema medible.

- **Restricciones (Constraints):** 
  - Un UUID opaco **no sustituye a la autorización**: cada endpoint sigue comprobando rol y propiedad del recurso en `SecurityConfiguration` y en los servicios. El UUID solo hace inviable la enumeración.
  - El cambio de tipo en `User` y `Notification` rompe la compatibilidad con datos antiguos; en desarrollo la base se regenera (`ddl-auto=update` sobre una base nueva).

- **Posiciones (Positions):** 
  1. **UUID v4 en todas las entidades (Seleccionada):** Identificadores no adivinables y un único tipo en todo el contrato.
  2. **Mantener `Long` y reforzar solo la autorización:** Menos cambios, pero deja la enumeración posible y mantiene dos tipos de identificador. Rechazada.
  3. **`Long` interno + identificador público aparte (`publicId`):** Conserva claves compactas, pero duplica columnas y mapeos en cada entidad. Rechazada por complejidad innecesaria en un monolito de este tamaño.
  4. **UUID ordenables por tiempo (v7 / ULID):** Mejor localidad de índice, pero requiere un generador propio, ya que Hibernate 5.6 no lo trae. Pospuesta mientras el volumen no lo justifique.

- **Argumento (Argument):** 
  Es la opción más simple que elimina la enumeración y deja un contrato homogéneo: el frontend trata todos los identificadores como cadenas opacas. Encaja con la invariante del proyecto de no exponer entidades ni claves predecibles.

- **Implicaciones (Implications):** 
  - Todas las rutas con identificador (`/api/incidents/{id}`, `/api/admin/users/{id}`, `/api/notifications/{id}/read`…) reciben `UUID`; un valor mal formado se rechaza antes de llegar al servicio.
  - Las pruebas de carga (`pruebas/k6/experimento1.js`) obtienen un UUID real en `setup()` en lugar de inventar uno.
  - Cualquier entidad nueva debe declarar `private UUID id` con `@GeneratedValue(strategy = GenerationType.AUTO)`.

- **Decisiones relacionadas (Related decisions):** 
  - *ADR-03:* Persistencia en PostgreSQL con Docker y JPA.
  - *ADR-06:* Manejador global de excepciones de la API.
  - *ADR-12:* Autenticación multi-rol con BCrypt y RBAC.

- **Requisitos relacionados (Related requirements):** 
  - **RF01:** Gestión de identidad y usuarios.

- **Artefactos relacionados (Related artifacts):** 
  - Paquete `com.urbanpulse.entity` (`User`, `Notification` y resto de entidades).
  - DTOs `UserResponse`, `NotificationResponse`, `CreateNotification`.
  - `docs/api/acuerdo-api.md` (identificadores `UUID` en el contrato).

- **Principios relacionados (Related principles):** 
  - **Seguridad por diseño:** no exponer identificadores predecibles.
  - **Contrato homogéneo:** un único tipo de identificador en toda la API.

- **Notas (Notes):** 
  Registrado en la Issue #54. La migración se hizo en el commit `abfd453` ("refactor(auth): standardize User entity and notifications to UUID identifier").
