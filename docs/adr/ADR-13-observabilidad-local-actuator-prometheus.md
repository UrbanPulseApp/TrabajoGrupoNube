# ADR-13: Observabilidad Local con Actuator, Prometheus y Grafana Restringida al Perfil `k6`

- **Asunto (Issue):** 
  Los experimentos de rendimiento con k6 (Issue #63, PR #70) necesitan cruzar la latencia medida por el generador de carga con métricas internas del backend: CPU de la JVM, hilos, conexiones de HikariCP activas y pendientes, y latencia HTTP por URI.
  La PR #70 añadió Spring Boot Actuator, Micrometer Prometheus y un stack local de Prometheus + Grafana, pero dejó `/actuator/metrics` y `/actuator/prometheus` expuestos y sin autenticación en la configuración por defecto, es decir, también en cualquier despliegue en la nube (Issue #71).

- **Decisión (Decision):** 
  Mantener Actuator y Micrometer Prometheus como dependencias del backend, pero **separar la exposición por perfil de Spring**:
  - **Configuración por defecto** (`application.properties`): solo se expone `health`, sin detalles de componentes. Cualquier otra ruta `/actuator/**` exige rol `ADMIN` en `SecurityConfiguration`.
  - **Perfil `k6`** (`application-k6.properties`, activado con `SPRING_PROFILES_ACTIVE=k6`): expone `health`, `info`, `metrics` y `prometheus`, activa el histograma de percentiles de `http.server.requests` y pone `urbanpulse.observability.public-metrics=true`, que permite el acceso anónimo a esas rutas para que Prometheus pueda recoger las métricas.
  Prometheus y Grafana se definen en `docker-compose.yml` bajo el perfil de Compose `observability`, publicados solo en `127.0.0.1`, y no forman parte del despliegue de la aplicación.

- **Estado (Status):** 
  Decidida.

- **Grupo (Group):** 
  Operación / Seguridad.

- **Supuestos (Assumptions):** 
  - La observabilidad detallada solo se necesita, por ahora, durante las pruebas de carga en local.
  - La instancia de pruebas se ejecuta en la máquina del desarrollador (puerto 8081) y no es accesible desde fuera.

- **Restricciones (Constraints):** 
  - Las métricas internas (rutas, tamaño del pool, carga de la JVM) no deben ser públicas en ningún entorno accesible desde Internet.
  - Siguiendo 12-Factor App, la diferencia entre entornos se resuelve con configuración externalizada (perfiles y propiedades), no con cambios de código.
  - Prometheus recoge métricas sin credenciales, así que en el perfil `k6` el endpoint tiene que ser anónimo.

- **Posiciones (Positions):** 
  1. **Exposición por perfil `k6` + `ADMIN` para el resto de Actuator (Seleccionada):** Seguro por defecto y sin fricción para las pruebas locales.
  2. **Exposición pública en todos los entornos (estado tras la PR #70):** Simple, pero publica información interna en producción. Rechazada.
  3. **Prometheus con autenticación (basic auth o token) en todos los entornos:** Más robusto para producción, pero obliga a gestionar secretos y usuarios técnicos que hoy no hacen falta. Pospuesta hasta que exista un despliegue con monitorización real.
  4. **Puerto de gestión separado (`management.server.port`) solo accesible en red interna:** Depende de la topología del despliegue en la nube, que aún no está definida. Pospuesta.

- **Argumento (Argument):** 
  La opción 1 mantiene el sistema seguro por defecto (solo `health`, útil para comprobaciones de disponibilidad del contenedor) y conserva intacto el flujo de diagnóstico de los experimentos k6. Además no añade infraestructura nueva al despliegue, en línea con el principio de evolución incremental.

- **Implicaciones (Implications):** 
  - La instancia de pruebas de `pruebas/k6/README.md` debe arrancarse con `SPRING_PROFILES_ACTIVE=k6`; sin ese perfil, Prometheus recibe 401 y el dashboard de Grafana se queda vacío.
  - Los tests `ActuatorSecurityTest` y `ActuatorK6ProfileTest` verifican ambos comportamientos.
  - Si en el futuro se monitoriza producción, este ADR se sustituirá por uno que defina la autenticación del scraping o un puerto de gestión interno (posiciones 3 y 4).

- **Decisiones relacionadas (Related decisions):** 
  - *ADR-02:* Uso de Spring Boot y API REST en el Backend.
  - *ADR-03:* Persistencia en PostgreSQL con Docker y JPA.

- **Requisitos relacionados (Related requirements):** 
  - Issue #63: Experimentos de rendimiento y observabilidad.
  - Issue #71: Restringir los endpoints de Actuator al perfil de pruebas k6.

- **Artefactos relacionados (Related artifacts):** 
  - `backend/src/main/resources/application.properties` y `application-k6.properties`.
  - `com.urbanpulse.config.SecurityConfiguration`.
  - `docker-compose.yml` (perfil `observability`) y `pruebas/observabilidad/`.

- **Principios relacionados (Related principles):** 
  - **Seguro por defecto:** lo que no se necesita en producción no se expone.
  - **12-Factor App:** configuración por entorno externalizada.

- **Notas (Notes):** 
  El número ADR-13 se reservó en la Issue #54, que registra los ADR-10 a ADR-12.
