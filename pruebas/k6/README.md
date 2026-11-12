# Experimentos k6 1 y 2

Los resultados y el análisis de las preguntas de la práctica están documentados en [`docs/resultados-k6-experimentos-1-2.md`](../../docs/resultados-k6-experimentos-1-2.md).

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
