# ADR-12: Autenticación Multi-rol con Sesiones, Contraseñas BCrypt, RBAC y Semillas de Usuarios

- **Asunto (Issue):** 
  UrbanPulse tiene perfiles con permisos muy distintos: el ciudadano reporta, el operador valida y asigna, el técnico ejecuta, el analista consulta estadísticas y el administrador gestiona cuentas. Hace falta autenticar a cada usuario, guardar sus credenciales de forma segura y autorizar cada endpoint según su rol.
  Además, el equipo necesita usuarios de prueba de cada rol en desarrollo, y en un despliegue real no debe existir ninguna cuenta con credenciales conocidas.

- **Decisión (Decision):** 
  - **Autenticación por sesión con Spring Security:** `POST /api/auth/login` autentica con `AuthenticationManager` (`UserService` como `UserDetailsService`), cambia el identificador de sesión (`ChangeSessionIdAuthenticationStrategy`, contra la fijación de sesión) y guarda el contexto en la sesión HTTP. La cookie `JSESSIONID` es `HttpOnly` y `SameSite=Strict`, y caduca a los 30 minutos. También existen `POST /api/auth/logout` y `GET /api/auth/me`.
  - **CSRF con `CookieCsrfTokenRepository`:** la cookie `XSRF-TOKEN` la puede leer el frontend, que la devuelve en la cabecera `X-XSRF-TOKEN` en las operaciones de escritura. Login y logout están exentos para no bloquear las transiciones de sesión de la SPA.
  - **Contraseñas con BCrypt:** el bean `PasswordEncoder` (`BCryptPasswordEncoder`) vive en `PasswordConfig` para evitar la dependencia circular entre `SecurityConfiguration` y `UserService`. Nunca se devuelven contraseñas en los DTOs.
  - **RBAC con cinco roles** (`CITIZEN`, `OPERATOR`, `TECHNICIAN`, `ADMIN`, `ANALYST`), mapeados a la autoridad `ROLE_<rol>`. Las reglas por ruta y método HTTP están centralizadas en `SecurityConfiguration#configure(HttpSecurity)`. El registro público (`POST /api/users`) crea siempre un `CITIZEN`; solo `ADMIN` asigna otros roles (`/api/admin/users`). Los errores 401 y 403 devuelven `ApiError` con `X-Request-ID`.
  - **Semillas y administrador inicial:**
    - `DatabaseDataLoader` carga `data/initial-data.json` (un usuario por rol y algunas incidencias de Málaga) **solo si la tabla de usuarios está vacía**, cifrando cada contraseña con BCrypt antes de guardarla.
    - `BootstrapAdmin` crea un administrador a partir de `URBANPULSE_ADMIN_EMAIL` y `URBANPULSE_ADMIN_PASSWORD` solo si se definen las dos variables; si falta una de ellas, el arranque falla.

- **Estado (Status):** 
  Decidida e implementada.

- **Grupo (Group):** 
  Seguridad / Identidad.

- **Supuestos (Assumptions):** 
  - El frontend se sirve desde el mismo sitio que la API (o a través de un proxy), así que las cookies `SameSite=Strict` funcionan.
  - El backend es un monolito con una sola instancia; la sesión en memoria del servidor es suficiente.

- **Restricciones (Constraints):** 
  - `initial-data.json` contiene contraseñas de prueba en claro y **solo sirve para desarrollo y pruebas**. Ahora mismo `DatabaseDataLoader` lo carga siempre que la tabla de usuarios esté vacía, también en una base de producción recién creada. Mientras esa carga no se condicione a un perfil o propiedad, en cualquier entorno compartido o desplegado hay que crear antes el administrador con `BootstrapAdmin` y revisar que no existan las cuentas de prueba.
  - Escalar horizontalmente obligaría a compartir las sesiones (por ejemplo, Spring Session con Redis o JDBC) o a migrar a tokens.
  - Cualquier endpoint nuevo debe tener su regla en `SecurityConfiguration` y su control de visibilidad por rol en React (`AuthContext`).

- **Posiciones (Positions):** 
  1. **Sesión con cookie `HttpOnly` + CSRF + BCrypt + RBAC por rutas (Seleccionada):** Soporte nativo de Spring Security, sin tokens accesibles desde JavaScript.
  2. **JWT sin estado en `localStorage`:** Facilita escalar horizontalmente, pero expone el token a XSS y complica la revocación. Rechazada.
  3. **Proveedor externo (OAuth2 / OIDC, Keycloak):** Más completo (SSO, MFA), pero añade un servicio a operar que el MVP no necesita. Pospuesta.
  4. **Autorización con `@PreAuthorize` en cada controlador:** Más granular, pero dispersa las reglas por el código. Se mantiene la tabla centralizada y se combina con comprobaciones en los servicios cuando dependen del recurso (por ejemplo, el técnico asignado).

- **Argumento (Argument):** 
  Las sesiones con cookie `HttpOnly` y protección CSRF son la opción más segura y sencilla para una SPA servida junto a su API. BCrypt protege las contraseñas aunque se filtre la base de datos, y una única tabla de reglas RBAC hace los permisos fáciles de revisar y probar con `MockMvc` y `@WithMockUser`.

- **Implicaciones (Implications):** 
  - Los clientes (frontend, k6) tienen que obtener primero `GET /api/auth/csrf`, enviar `credentials: 'include'` y adjuntar `X-XSRF-TOKEN` en las escrituras (`frontend/src/services/ApiClient.js`, `pruebas/k6/lib/auth.js`).
  - Las pruebas de seguridad se escriben con `@WithMockUser(roles = ...)` (por ejemplo, `AnalyticsControllerTest`).
  - En producción no se debe cargar `initial-data.json` (aviso en `docs/deployment.md`). Queda pendiente condicionar `DatabaseDataLoader` a un perfil de desarrollo para que no dependa del procedimiento manual.

- **Decisiones relacionadas (Related decisions):** 
  - *ADR-02:* Uso de Spring Boot y API REST en el Backend.
  - *ADR-05:* Máquina de estados (transiciones permitidas por rol).
  - *ADR-06:* Manejador global de excepciones de la API (`ApiError` y `X-Request-ID`).
  - *ADR-10:* Estandarización de identificadores UUID.
  - *ADR-13:* Observabilidad local restringida al perfil `k6` (rutas de Actuator protegidas por rol; Issue #71).

- **Requisitos relacionados (Related requirements):** 
  - **RF01:** Gestión de identidad y usuarios.
  - **RF02:** Permisos por rol en el ciclo de vida.

- **Artefactos relacionados (Related artifacts):** 
  - `com.urbanpulse.config`: `SecurityConfiguration`, `PasswordConfig`, `BootstrapAdmin`, `DatabaseDataLoader`.
  - `AuthController`, `UserService`, `AdminUserController` y `backend/src/main/resources/data/initial-data.json`.
  - `frontend/src/context/AuthContext.jsx` y `frontend/src/services/AuthService.js`.
  - `docs/api/acuerdo-api.md` (tabla de permisos por rol).

- **Principios relacionados (Related principles):** 
  - **Mínimo privilegio:** el registro público solo crea ciudadanos.
  - **Sin credenciales predeterminadas en producción:** el administrador se crea con secretos de entorno.

- **Notas (Notes):** 
  Registrado en la Issue #54.
