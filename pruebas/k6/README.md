# Pruebas de carga k6 y observabilidad

Los cuatro experimentos y sus resultados están documentados en [`docs/resultados-k6.md`](../../docs/resultados-k6.md).

## Requisitos y arranque

Se necesita Docker, Java/Maven, k6 y PostgreSQL. El Compose base inicia PostgreSQL; el backend y el frontend se inician por separado. No hace falta abrir IntelliJ ni el frontend para ejecutar los scripts.

```sh
docker compose up -d postgres
cd backend
mvn spring-boot:run
```

El backend usa por defecto `jdbc:postgresql://localhost:5432/urbanpulse` y escucha en el puerto 8080. Los scripts k6 se ejecutan desde la raíz del repositorio y aceptan `--env BASE_URL=...` para apuntar a otra instancia.

## Observabilidad con Prometheus y Grafana

El backend incorpora Spring Boot Actuator y Micrometer Prometheus. Para probar sin detener la instancia habitual, se puede iniciar una segunda instancia en el puerto 8081; ajusta `DATABASE_URL` si quieres medir otra base:

```powershell
$env:PORT = '8081'
$env:DATABASE_URL = 'jdbc:postgresql://localhost:5432/urbanpulse'
cd backend
mvn spring-boot:run
```

En otra terminal, inicia Prometheus y Grafana:

```sh
docker compose --profile observability up -d postgres prometheus grafana
```

Prometheus recoge métricas de `http://localhost:8081/actuator/prometheus` cada 5 segundos. La URL del dashboard provisionado es [`http://localhost:3000/d/urbanpulse-performance/urbanpulse-performance`](http://localhost:3000/d/urbanpulse-performance/urbanpulse-performance); el acceso inicial de Grafana es `admin` / `admin` y pide cambiar la contraseña. El dashboard muestra p95 HTTP, CPU del proceso JVM, hilos activos y conexiones HikariCP activas y pendientes. Mantén estas rutas expuestas solo en el entorno local de pruebas.

Para abrir el dashboard web integrado de k6 durante una prueba, activa estas variables antes de ejecutar el comando:

```powershell
$env:K6_WEB_DASHBOARD = 'true'
$env:K6_WEB_DASHBOARD_EXPORT = 'k6-report.html'
k6 run --env BASE_URL=http://localhost:8081 pruebas/k6/experimento1.js
```

El dashboard de k6 se sirve en `http://localhost:5665`; el informe HTML se genera al terminar. Grafana/Prometheus permiten correlacionar esa carga con métricas del backend.

Los experimentos 1–4 aplican el mismo límite de aceptación: p95 menor de 500 ms por operación y menos de 1 % de errores HTTP. En los ejecutores de llegada también se exige `dropped_iterations=0`.

## Experimento 1: línea base de endpoints

```sh
k6 run --env BASE_URL=http://localhost:8081 pruebas/k6/experimento1.js
```

Mide, en bloques separados de 2 minutos con 10 VUs, listado paginado, búsqueda de duplicados y detalle. Con el `sleep(1)` por defecto, el throughput lo marca la pausa (unas 10 req/s por operación). Para comparar el throughput real de cada operación, ejecuta la variante sin pausa:

```sh
k6 run --env BASE_URL=http://localhost:8081 --env SLEEP_SECONDS=0 --env DURATION_SECONDS=60 pruebas/k6/experimento1.js
```
 Obtiene un UUID existente en `setup()` para que el endpoint de detalle no dependa de un identificador inventado. Ejecuta el script tres veces y conserva p50, p95, p99, tasa de peticiones y errores de cada operación.

## Experimento 2: capacidad y punto de degradación

El perfil por defecto conserva la línea de VUs 10, 25, 50 y 100:

```sh
k6 run --env BASE_URL=http://localhost:8081 pruebas/k6/experimento2.js
```

Para localizar el punto de degradación, sube la tasa de llegada progresivamente. El conjunto comparativo de esta entrega usa una duración de un minuto, 800 VUs preasignados y hasta 2.000 VUs:

```sh
k6 run --env BASE_URL=http://localhost:8081 --env MODE=constant --env RATE=500 --env PREALLOCATED_VUS=800 --env MAX_VUS=2000 --env DURATION=1m pruebas/k6/experimento2.js
k6 run --env BASE_URL=http://localhost:8081 --env MODE=constant --env RATE=600 --env PREALLOCATED_VUS=800 --env MAX_VUS=2000 --env DURATION=1m pruebas/k6/experimento2.js
k6 run --env BASE_URL=http://localhost:8081 --env MODE=constant --env RATE=700 --env PREALLOCATED_VUS=800 --env MAX_VUS=2000 --env DURATION=1m pruebas/k6/experimento2.js
k6 run --env BASE_URL=http://localhost:8081 --env MODE=constant --env RATE=750 --env PREALLOCATED_VUS=800 --env MAX_VUS=2000 --env DURATION=1m pruebas/k6/experimento2.js
k6 run --env BASE_URL=http://localhost:8081 --env MODE=constant --env RATE=800 --env PREALLOCATED_VUS=800 --env MAX_VUS=2000 --env DURATION=1m pruebas/k6/experimento2.js
```

Ejecuta cada tasa al menos tres veces y conserva la misma máquina, datos y duración. Una ejecución puede terminar con código 99 cuando ha recopilado resultados pero uno o más umbrales no se cumplen; eso identifica el nivel de carga que incumple el SLO. También se puede explorar el modelo cerrado con más VUs y sin tiempo de espera:

```sh
k6 run --env BASE_URL=http://localhost:8081 --env MODE=vus --env VUS_LEVELS=100,200,400,800 --env SLEEP_SECONDS=0 --env RAMP_SECONDS=30 --env HOLD_SECONDS=60 pruebas/k6/experimento2.js
```

`dropped_iterations` cuenta las iteraciones de un ejecutor de tasa que estaban planificadas pero no pudieron empezar porque k6 no tenía VUs libres. Un valor distinto de cero significa que no se aplicó toda la carga solicitada; aquí se exige cero y se amplían `preAllocatedVUs`/`maxVUs` para evitar que el generador sea el límite.

## Experimento 3: pico de incidencias y efecto del mapa

```sh
k6 run --env BASE_URL=http://localhost:8081 --env MAP_VUS=30 --env BASELINE_RATE=2 --env SPIKE_RATE=800 --env RECOVERY_RATE=2 --env PRELUDE_SECONDS=30 --env BASELINE_SECONDS=30 --env SPIKE_RAMP_SECONDS=15 --env SPIKE_HOLD_SECONDS=75 --env RECOVERY_SECONDS=75 --env PREALLOCATED_VUS=100 --env SPIKE_PREALLOCATED_VUS=800 --env MAX_VUS=2000 pruebas/k6/experimento3.js
```

El escenario registra por separado la fase previa (`pre-pico`), el pico (`pico`) y la recuperación (`recuperacion`), tanto para la creación como para la consulta del mapa: cada petición del mapa se etiqueta con la fase de creación que está en curso en ese momento (los 30 s de preludio cuentan como `pre-pico`). Estos son los parámetros del perfil documentado en `docs/resultados-k6.md`. La tasa máxima debe fijarse por encima del primer nivel degradado del experimento 2. Para la ejecución de control, se usa el mismo perfil y se desactiva solo el tráfico de mapa:

```sh
k6 run --env BASE_URL=http://localhost:8081 --env INCLUDE_MAP=false --env BASELINE_RATE=2 --env SPIKE_RATE=800 --env RECOVERY_RATE=2 --env PRELUDE_SECONDS=30 --env BASELINE_SECONDS=30 --env SPIKE_RAMP_SECONDS=15 --env SPIKE_HOLD_SECONDS=75 --env RECOVERY_SECONDS=75 --env PREALLOCATED_VUS=100 --env SPIKE_PREALLOCATED_VUS=800 --env MAX_VUS=2000 pruebas/k6/experimento3.js
```

Ejecuta tres pasadas con mapa y tres de control. Restaura el mismo volumen de incidencias antes de cada pasada; este script crea incidencias reales y no las borra.

## Experimento 4: volumen, índices y modificaciones

Este experimento mide filtrado, paginación profunda y agregados de PostgreSQL. En paralelo mantiene una carga menor que crea incidencias y modifica su estado mediante `PATCH /api/incidents/{id}`. Todas las operaciones tienen métricas y umbrales separados.

Para mantener intacta la base de desarrollo, crea una base desechable una sola vez:

```sh
docker compose exec -T postgres createdb -U postgres -T template0 urbanpulse_k6
```

Inicia una instancia del backend en el puerto 8081 apuntando a esa base. Spring Boot crea el esquema y los usuarios de prueba al arrancar; después aplica el script SQL, que vacía las tablas de incidencias relacionadas y las rellena con el tamaño solicitado. El script se protege para ejecutarse solo contra `urbanpulse_k6`.

```powershell
docker compose cp pruebas/k6/sql/seed-volume.sql postgres:/tmp/seed-volume.sql
docker compose exec -T postgres psql -U postgres -d urbanpulse_k6 -v target_rows=1000 -f /tmp/seed-volume.sql
```

Si ejecutas estos comandos desde Git Bash en lugar de PowerShell, antepón `MSYS_NO_PATHCONV=1`: si no, Git Bash convierte `/tmp/seed-volume.sql` en una ruta de Windows, `psql` no encuentra el fichero y la base se queda sin sembrar. Comprueba siempre el volumen con `SELECT count(*) FROM incidents;` antes de lanzar k6.

Repite el proceso con `target_rows=10000`, `100000` y `1000000`. Para **cada** repetición se debe volver a sembrar el tamaño exacto porque la carga concurrente crea incidencias. Ejecuta tres pasadas por tamaño sin índices adicionales y otras tres con los índices:

```powershell
docker compose cp pruebas/k6/sql/drop-indexes.sql postgres:/tmp/drop-indexes.sql
docker compose exec -T postgres psql -U postgres -d urbanpulse_k6 -f /tmp/drop-indexes.sql
docker compose cp pruebas/k6/sql/create-indexes.sql postgres:/tmp/create-indexes.sql
docker compose exec -T postgres psql -U postgres -d urbanpulse_k6 -f /tmp/create-indexes.sql
```

Los índices comparados corresponden a los predicados reales de `IncidentService`: el filtro transforma la categoría con `lower(category)`, por eso se usa el índice funcional `(status, lower(category), created_at DESC)` junto al índice `(created_at DESC)` para ordenar y recorrer la paginación profunda. El script `explain-volume.sql` compara el plan de las consultas antes y después de crearlos. La carga se configura con `STAGE_SECONDS=30`, `VUS=15` y `WRITER_VUS=3` para acortar las repeticiones; se pueden aumentar para mediciones más largas.

Para comprobar el plan de las dos consultas antes y después de crear los índices:

```powershell
docker compose cp pruebas/k6/sql/explain-volume.sql postgres:/tmp/explain-volume.sql
docker compose exec -T postgres psql -U postgres -d urbanpulse_k6 -f /tmp/explain-volume.sql
```

En cada pasada, vuelve a cargar el tamaño de datos elegido antes de ejecutar k6. Repite el ciclo de sembrado y ejecución tres veces por tamaño y estado de indexación; así la escritura concurrente no hace que las pasadas posteriores empiecen con más filas.

```sh
k6 run --env BASE_URL=http://localhost:8081 --env STAGE_SECONDS=30 --env VUS=15 --env WRITER_VUS=3 pruebas/k6/experimento4.js
```

La carga de escritura y modificación es persistente. Al terminar, detén el backend de pruebas y elimina únicamente la base desechable:

```sh
docker compose exec -T postgres dropdb -U postgres --force urbanpulse_k6
```
