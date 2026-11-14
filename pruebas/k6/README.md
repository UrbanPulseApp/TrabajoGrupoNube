# Experimentos k6 1, 2, 3 y 4

Los resultados y el análisis de los cuatro experimentos están documentados en [`docs/resultados-k6.md`](../../docs/resultados-k6.md).

Requisitos: PostgreSQL iniciado, backend UrbanPulse iniciado y k6 instalado. El `docker-compose.yml` levanta solo PostgreSQL. Desde la raíz del repositorio, inicia la base de datos (si aún no está activa):

```sh
docker compose up -d postgres
```

Espera a que el contenedor esté saludable y, en otra terminal, inicia el backend:

```sh
cd backend
mvn spring-boot:run
```

Espera a que Spring indique que ha arrancado y ejecuta los comandos k6 desde la raíz del repositorio. El backend usa por defecto `jdbc:postgresql://localhost:5432/urbanpulse`, con las credenciales de desarrollo definidas como valores por defecto en Compose y `application.properties`. No es necesario iniciar IntelliJ ni el frontend. Por defecto, los scripts usan `http://localhost:8080`; se puede cambiar con `--env BASE_URL=...`.

## Experimento 1: línea base por operación

```sh
k6 run pruebas/k6/experimento1.js
```

Ejecuta tres operaciones de lectura respaldadas por la API de incidencias, una detrás de otra, con 10 VUs durante 2 minutos cada una: listado paginado, búsqueda de duplicados y consulta de detalle. Antes de empezar, obtiene un UUID real del listado para que la consulta de detalle no dependa de un identificador inventado. El resumen incluye tendencias independientes de latencia (mediana/p50, p95 y p99) y contadores de peticiones y errores por operación; calcula el throughput de cada bloque como sus peticiones divididas por 120 segundos. La petición inicial solo prepara el UUID y no debe incluirse en la comparación.

## Experimento 2: capacidad y saturación

Por defecto ejecuta la carga creciente de VUs (10, 25, 50 y 100), manteniendo cada nivel durante un minuto:

```sh
k6 run pruebas/k6/experimento2.js
```

También permite una tasa fija de iteraciones por segundo. Repite la ejecución con valores distintos de `RATE` para localizar el punto de degradación:

```sh
k6 run --env MODE=constant --env RATE=10 pruebas/k6/experimento2.js
k6 run --env MODE=constant --env RATE=25 pruebas/k6/experimento2.js
k6 run --env MODE=constant --env RATE=50 pruebas/k6/experimento2.js
k6 run --env MODE=constant --env RATE=100 pruebas/k6/experimento2.js
```

El modo `ramping` explora una tasa de llegada que sube progresivamente de 10 a 100 iteraciones por segundo:

```sh
k6 run --env MODE=ramping pruebas/k6/experimento2.js
```

En los modos por tasa se controlan los `dropped_iterations`; si no hay VUs disponibles para iniciar las iteraciones solicitadas, el threshold falla. Ajusta `PREALLOCATED_VUS`, `MAX_VUS` y `DURATION` con `--env` según la máquina disponible. Usa la misma base de datos y configuración en todas las ejecuciones y repite cada configuración al menos tres veces. No se fija un umbral de latencia arbitrario: identifica la degradación a partir de los resultados observados.

## Experimento 3: pico de emergencias urbanas

```sh
k6 run pruebas/k6/experimento3.js
```

Simula un episodio de lluvias intensas en Málaga durante 3 minutos y 30 segundos combinando dos escenarios concurrentes:

1. `consulta_mapa`: tráfico constante de 30 VUs consultando `GET /api/incidents?page=0&size=50&sort=-createdAt`.
2. `pico_incidencias`: ráfaga mediante `ramping-arrival-rate` que sube de 2 a 60 iteraciones/s de creación (`POST /api/incidents`) y vuelve a 2 iteraciones/s para medir la recuperación.

En la fase `setup()`, el script inicia sesión con el usuario de prueba `juan.perez@ciudadano.es` (`contrasenasegura123`) y obtiene el token `XSRF-TOKEN` desde `/api/auth/csrf` para reutilizar la sesión autenticada en todas las peticiones `POST`. Se pueden ajustar `MAP_VUS`, `SPIKE_RATE`, `PREALLOCATED_VUS` y `MAX_VUS` mediante `--env`.

Este experimento inserta incidencias reales en PostgreSQL y no las elimina al terminar. Con la configuración por defecto puede crear alrededor de 5.500 filas; guarda una copia de la base antes de ejecutarlo o usa una base aislada.

## Experimento 4: volumen de datos e indexación

```sh
k6 run pruebas/k6/experimento4.js
```

Ejecuta secuencialmente cuatro escenarios con 15 VUs durante 1 minuto cada uno (autenticando el usuario operador y obteniendo CSRF en `setup()`):

1. `consulta_filtrada`: `GET /api/incidents?status=REPORTED&category=STREET&page=0&size=20&sort=-createdAt`
2. `paginacion_profunda`: `GET /api/incidents?page=50&size=20&sort=-createdAt`
3. `consulta_analitica`: `GET /api/analytics/summary` (agregados calculados desde PostgreSQL; requiere rol operador, administrador o analista)
4. `escritura_concurrente`: `POST /api/incidents`

El intervalo entre escenarios es de 5 segundos. Se pueden reducir las pruebas funcionales con `--env VUS=1 --env STAGE_SECONDS=5`; cada bloque usa 5 segundos y el informe calcula el throughput por operación como el número de peticiones dividido por los segundos del bloque. La configuración por defecto puede crear alrededor de 900 incidencias en el último bloque. Las escrituras permanecen en PostgreSQL al terminar, así que ejecuta el test en una base aislada o limpia las filas sintéticas antes de repetirlo.

`GET /api/opendata/incidents` no sirve para medir el efecto del volumen o de los índices de `incidents`: el backend carga ese recurso desde un CSV estático incluido en el proyecto.

Las escrituras de este escenario son persistentes. Para comparar volúmenes o índices, restaura una copia de PostgreSQL con el mismo número de filas antes de **cada** ejecución; si se repite el script sin restaurar, el bloque `POST` añade alrededor de 900 filas por pasada y las mediciones dejan de ser comparables. Prepara una copia para cada condición: volumen base, volumen ampliado e índices.

Para comparar distintos volúmenes y medir el efecto de la indexación en PostgreSQL:

1. Ejecuta el script tres veces sobre el volumen base y anota el recuento de filas en `incidents`.
2. Inserta registros sintéticos hasta alcanzar ~100.000 incidencias y repite el script tres veces sin índices extra.
3. Crea los índices sobre los campos filtrados y ordenados, actualiza estadísticas y repite tres veces:

```sql
CREATE INDEX idx_incidents_status_category_created ON incidents (status, category, created_at DESC);
CREATE INDEX idx_incidents_created_at ON incidents (created_at DESC);
ANALYZE incidents;
```

4. Al terminar, restaura la copia base para quitar los índices y las filas sintéticas, o elimina los índices adicionales (`DROP INDEX IF EXISTS idx_incidents_status_category_created, idx_incidents_created_at;`) y restaura también el conjunto de filas original.
