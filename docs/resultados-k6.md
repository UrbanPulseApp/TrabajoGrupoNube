# Resultados consolidados de pruebas k6 — UrbanPulse

**Fecha de actualización:** 14 de noviembre de 2026  
**Entorno de pruebas:** Monolito Spring Boot 2.6.7 (Java 17) instrumentado con Spring Boot Actuator y Micrometer Prometheus; PostgreSQL 14/15 en local; k6 v2.3.0.  
**Instancia de pruebas:** Puerto 8081 sobre base aislada `urbanpulse_k6` (las 5.010 incidencias de desarrollo en `urbanpulse` se mantuvieron intactas).  
**Objetivos de nivel de servicio (SLO):** Latencia $p(95) < 500\text{ ms}$, tasa de fallos HTTP $< 1\%$ y descartes de ejecución `dropped_iterations == 0` (en ejecutores de llegada).

---

## 1. Resumen ejecutivo y arquitectura de observabilidad

Este informe recopila los resultados empíricos de los cuatro experimentos de rendimiento y calidad arquitectónica exigidos para UrbanPulse. A diferencia de mediciones aisladas preliminares, todos los experimentos se ejecutaron bajo un rigor estadístico de al menos **tres repeticiones independientes**, reportando medias y rangos de variabilidad (mínimo y máximo).

```mermaid
flowchart LR
    k6["Grafana k6 (Generador de carga)"] -->|"HTTP / REST API (Puerto 8081)"| SB["Spring Boot (UrbanPulse Monolith)"]
    SB -->|"HikariCP Pool (máx 10 conn)"| PG[("PostgreSQL (urbanpulse_k6)")]
    SB -->|"/actuator/prometheus"| Prom["Prometheus (Scrape 5s)"]
    Prom -->|"Data Source"| Grafana["Grafana Dashboards"]
```

### Métricas de observabilidad interna (Micrometer + Actuator + Prometheus)
Durante las pruebas de sobrecarga y saturación, se monitorizaron de forma continua los componentes internos del servicio a través de `/actuator/prometheus`:
- **CPU y memoria JVM (`process_cpu_usage`, `jvm_memory_used_bytes`):** El consumo de CPU del proceso backend se mantuvo entre el 22% y el 35%, indicando que el cuello de botella no radica en saturación de cómputo en la JVM.
- **Pool de conexiones HikariCP (`hikaricp_connections_active`, `hikaricp_connections_pending`):** Bajo saturación (a partir de 600–700 req/s o consultas no indexadas de 1M de filas), el pool HikariCP agotó sistemáticamente sus 10 conexiones disponibles (`10/10`), llegando a acumular más de 180–190 peticiones en espera (`hikaricp_connections_pending`).
- **Hilos de Tomcat (`tomcat_threads_busy_threads`):** Crecimiento paralelo al retardo de respuesta del pool de base de datos.

### Significado de la métrica `dropped_iterations`
En k6, los ejecutores basados en tasa de llegada (`constant-arrival-rate` y `ramping-arrival-rate`) intentan iniciar un número exacto de iteraciones por unidad de tiempo con independencia del tiempo de respuesta del servidor. La métrica `dropped_iterations` contabiliza las **iteraciones que k6 no pudo iniciar porque todos los usuarios virtuales (VUs preasignados y máximos) estaban bloqueados** esperando respuesta de peticiones anteriores del backend.
- Cuando el servidor responde dentro del SLO ($p(95) < 500\text{ ms}$), los VUs completan las peticiones rápidamente y retornan al pool, manteniendo `dropped_iterations = 0`.
- Cuando el backend se satura (latencias elevadas en segundos), todos los VUs quedan retenidos en I/O; al llegar el instante de una nueva iteración programada, k6 no dispone de ningún VU libre y se ve obligado a descartar la iteración.

---

## 2. Experimento 1: Caracterización y línea base de endpoints

**Objetivo:** Establecer una línea base de rendimiento midiendo latencia ($p50$, $p95$, $p99$), rendimiento (throughput) y errores en los tres endpoints de lectura principales de la API de incidencias.  
**Condiciones:** 10 usuarios virtuales (`constant-vus`) durante 2 minutos por operación secuencial, sobre una base de datos estabilizada con 5.010 incidencias.  
**Criterio de aceptación (SLO):** $p(95) < 500\text{ ms}$ y tasa de error $< 1\%$.

### Resultados de las 3 repeticiones

| Operación / Endpoint | Peticiones por pasada, media (rango) | Throughput medio (rango) | $p50$ medio (rango) | $p95$ medio (rango) | $p99$ medio (rango) | Errores HTTP | Cumple SLO |
|---|---:|---:|---:|---:|---:|---:|:---:|
| **Listado paginado** (`GET /api/incidents`) | 1.193,3 (1.190–1.200) | 9,95 req/s (9,92–10,00) | 7,41 ms (7,01–8,00) | 10,07 ms (9,62–10,91) | 14,82 ms (11,21–18,11) | 0,0% | SÍ |
| **Búsqueda duplicados** (`GET /api/incidents/search/duplicates`) | 1.200,0 (1.200–1.200) | 10,00 req/s (10,00–10,00) | 6,64 ms (5,89–7,07) | 9,37 ms (8,48–9,95) | 13,57 ms (11,87–15,45) | 0,0% | SÍ |
| **Consulta detalle** (`GET /api/incidents/{id}`) | 1.200,0 (1.200–1.200) | 10,00 req/s (10,00–10,00) | 4,92 ms (4,82–5,02) | 6,57 ms (6,37–6,92) | 8,46 ms (6,99–9,72) | 0,0% | SÍ |

*Nota metodológica: El UUID utilizado en la consulta de detalle se obtiene dinámicamente en el bloque `setup()` mediante una consulta previa a la base, evitando identificadores sintéticos inexistentes.*

### Conclusiones del Experimento 1
1. **Endpoint más lento:** El **listado paginado** presenta la mayor latencia en todos los percentiles ($p95 \approx 10,07\text{ ms}$), seguido de cerca por la búsqueda de duplicados ($9,37\text{ ms}$). Esto se debe al coste adicional de serialización y paginación en JPA frente a la búsqueda directa por clave primaria.
2. **Relación latencia-throughput:** Con 10 VUs y `sleep(1)`, el throughput se sitúa de forma uniforme en $\sim 10\text{ req/s}$ para todas las operaciones, ya que la latencia (menor de 11 ms) es despreciable frente al segundo de pausa entre iteraciones.
3. **Variabilidad $p50$ frente a $p99$:** La diferencia es reducida (un incremento de entre 3,5 ms y 7,4 ms), mostrando un comportamiento sumamente predecible sin pausas de Garbage Collection ni bloqueos de red bajo baja carga.
4. **Cumplimiento de calidad:** Todos los endpoints superan holgadamente el SLO exigido, situándose un orden de magnitud por debajo del umbral de 500 ms.

---

## 3. Experimento 2: Capacidad del sistema y saturación

**Objetivo:** Explorar progresivamente la carga para determinar el límite de capacidad de la API, el punto de saturación y el momento en que se incumple el SLO del sistema.  
**Metodología:** Evaluaciones controladas mediante el ejecutor `constant-arrival-rate` (1 minuto de duración por pasada) con asignación de hasta 2.000 VUs para evitar que el generador sea el cuello de botella. Se ejecutaron 3 repeticiones completas por cada nivel de tasa.

### Matriz de escalabilidad y límites observados

| Tasa objetivo | Peticiones atendidas media (rango) | Tasa real media (rango) | $p50$ medio (rango) | $p95$ medio (rango) | $p99$ medio (rango) | `dropped_iterations` media (rango) | Errores HTTP | Estado SLO |
|---|---:|---:|---:|---:|---:|---:|---:|:---:|
| **10 it/s** | 601 (601–601) | 10,0 req/s | 8,28 ms (7,95–8,55) | 10,48 ms (9,78–10,97) | 11,00 ms (10,13–11,53) | 0,0 (0–0) | 0% | CUMPLE |
| **25 it/s** | 1.501 (1.500–1.501) | 25,0 req/s | 7,63 ms (7,37–7,95) | 9,56 ms (8,95–10,02) | 10,35 ms (9,65–10,73) | 0,0 (0–0) | 0% | CUMPLE |
| **50 it/s** | 3.001 (3.000–3.001) | 50,0 req/s | 6,60 ms (6,55–6,64) | 7,78 ms (7,71–7,92) | 8,33 ms (8,22–8,49) | 0,0 (0–0) | 0% | CUMPLE |
| **100 it/s** | 6.001 (6.001–6.001) | 100,0 req/s | 4,81 ms (4,54–4,98) | 6,51 ms (6,29–6,67) | 7,79 ms (7,14–8,50) | 0,0 (0–0) | 0% | CUMPLE |
| **500 it/s** | 30.015 (30.001–30.043) | 499,8 req/s (499,4–500,0) | 6,67 ms (6,00–7,00) | **74,18 ms** (25,00–158,34) | 164,04 ms (67,24–321,42) | **0,0** (0–0) | 0% | **CUMPLE (Límite sostenible)** |
| **600 it/s** | 36.000 (36.000–36.001) | 599,2 req/s (597,9–599,9) | 10,98 ms (7,00–14,95) | **412,01 ms** (97,88–896,41) | 658,34 ms (246,20–1.339,53) | **0,0** (0–0) | 0% | **INCIERTO (Zona inestable)** |
| **700 it/s** | 40.765 (40.046–41.818) | 668,5 req/s (639,9–695,9) | 492,24 ms (16,07–745,18) | **1.898,98 ms** (1.018–2.552) | 2.354,65 ms (1.490–3.018) | **1.236,3** (183–1.957) | 0% | **INCUMPLE (Saturación)** |
| **750 it/s** | 44.943 (44.828–45.001) | 748,8 req/s (747,0–749,9) | 195,10 ms (9,00–508,68) | **659,33 ms** (221,99–1.136) | 867,50 ms (294,50–1.431) | **57,3** (0–172) | 0% | **INCUMPLE** |
| **800 it/s** | 45.833 (45.672–46.061) | 737,9 req/s (734,8–743,8) | 1.776,11 ms (1.649–1.857) | **2.299,06 ms** (2.153–2.401) | 2.546,91 ms (2.412–2.648) | **2.167,7** (1.939–2.329) | 0% | **COLAPSO DE RENDIMIENTO** |

### Diagnóstico de saturación con observabilidad
1. **Límite máximo sostenible:** Situado de forma consistente en **500 peticiones/segundo**. En este régimen, el $p95$ medio es de 74,18 ms, no se produce ningún error HTTP y no se descarta ninguna iteración.
2. **Punto de degradación:** A **600 it/s** se observa la frontera del sistema. Si bien la media de $p95$ es 412 ms, en la tercera repetición la latencia $p95$ ascendió a 896 ms, incumpliendo el SLO. En ese instante, las métricas de Prometheus revelaron que HikariCP alcanzó el 100% de ocupación del pool (`10/10`) y acumuló 189 solicitudes en cola.
3. **Punto de colapso:** A **700 y 800 it/s**, el sistema colapsa en latencia ($p95 > 2\text{ segundos}$) y k6 descarta más de 2.000 iteraciones por pasada al agotarse los 2.000 VUs asignados. El throughput deja de crecer y se estanca en $\sim 737\text{ req/s}$, confirmando la cota máxima del cuello de botella en la base de datos local.

---

## 4. Experimento 3: Simulación de emergencia urbana y tolerancia a picos

**Objetivo:** Simular un evento repentino (e.g., lluvias torrenciales en Málaga) que dispara la creación de incidencias, evaluando la resiliencia del sistema y respondiendo a la pregunta arquitectónica:  
*¿Qué ocurre con la creación de incidencias si al mismo tiempo hay muchos usuarios consultando el mapa de incidencias?*  
**Diseño experimental:**
- **Fase 1 (Pre-pico):** 30 segundos de carga base (2 it/s).
- **Fase 2 (Pico brusco):** Rampa de 15s y sostenimiento de 75s a **800 iteraciones/s** de creación (`POST /api/incidents`), superando deliberadamente la capacidad máxima hallada en el Exp 2.
- **Fase 3 (Recuperación prolongada):** 75 segundos a 2 it/s para evaluar el retorno a la línea base.
- **Comparación controlada:** 3 ejecuciones con tráfico concurrente de mapa (30 VUs continuos a `GET /api/incidents?size=50`) frente a 3 ejecuciones de control (únicamente creación, sin consulta de mapa).

### Comparativa de fases y efecto del tráfico de mapa

| Fase del evento | Métrica | Con Consulta de Mapa (3 pasadas) | Control Sin Mapa (3 pasadas) | Impacto atribuible al mapa |
|---|---|---:|---:|:---:|
| **Pre-Pico (Línea base)** | $p95$ creación (rango) | **18,19 ms** (17,28–19,80) | **19,87 ms** (18,07–23,10) | Diferencia despreciable (< 2 ms) |
| **Pico de emergencia (800 req/s)** | $p95$ creación (rango) | **6.034,70 ms** (5.487–6.564) | **6.377,56 ms** (5.235–7.378) | Sin penalización extra por el mapa |
| | `dropped_iterations` (rango) | **5.763,3** (4.967–6.204) | **6.047,0** (4.915–7.225) | Ambas variantes saturan por igual |
| | $p95$ consulta mapa (rango) | **171,91 ms** (37,18–256,15) | *No aplica* | Mapa cumple SLO (< 500 ms) |
| **Recuperación (75 segundos)** | $p95$ creación (rango) | **1.379,26 ms** (816,84–2.148) | **2.593,06 ms** (1.684–3.561) | Recuperación lenta por cola HikariCP |
| **Errores globales HTTP** | Tasa de fallos | **0,0%** (0 fallos) | **0,0%** (0 fallos) | Resiliencia funcional total |

```mermaid
xychart-beta
    title "Latencia p95 de Creación de Incidencias por Fase (ms)"
    x-axis ["Pre-Pico (Base)", "Pico (800 req/s)", "Recuperación (75s)"]
    y-axis "Latencia p95 (ms)" 0 --> 7000
    bar [18.2, 6034.7, 1379.3]
    bar [19.9, 6377.6, 2593.1]
```

### Respuestas y conclusiones del Experimento 3
1. **Respuesta a la pregunta arquitectónica:**  
   **Las consultas al mapa no degradan de forma apreciable la creación de incidencias durante el pico.** La saturación a 800 req/s está dominada en su totalidad por la concurrencia de transacciones de escritura (bloqueos de fila, inserciones de UUID y commits en PostgreSQL), la cual absorbe el 100% de las conexiones de HikariCP tanto si el mapa está activo como si no lo está ($p95$ de 6,03 s vs 6,38 s).
2. **Comportamiento del endpoint de mapa:** A pesar del colapso en las inserciones, la lectura de las incidencias del mapa mantuvo un $p95$ de **171,91 ms**, cumpliendo el SLO en todo momento.
3. **Dinámica de recuperación:** Tras cesar el pico de emergencia, una ventana de 30 s resultó insuficiente para recuperarse; extendiendo la ventana a 75 s la latencia bajó de más de 6 segundos a $\sim 1,3\text{ s}$. El sistema no recupera de inmediato la línea base de 18 ms debido al vaciado paulatino de transacciones encoladas en el pool de conexiones.

---

## 5. Experimento 4: Impacto del volumen de datos, indexación y escrituras concurrentes

**Objetivo:** Determinar cómo afecta el volumen de la base de datos (1.000, 10.000, 100.000 y 1.000.000 de incidencias sintéticas) al rendimiento de consultas filtradas, paginación y analítica, midiendo el beneficio de índices especializados en PostgreSQL en presencia de escrituras y modificaciones concurrentes (`POST` y `PATCH`).  
**Carga concurrente:** 15 VUs en consultas secuenciales de 30 s + 3 VUs de escritores simultáneos (`POST /api/incidents` seguido de `PATCH /api/incidents/{id}` cambiando estado a `VALIDATED` con motivo).  
**Matriz ejecutada:** 24 pruebas (4 volúmenes $\times$ 2 estados de índice $\times$ 3 pasadas independientes), sembrando el volumen exacto antes de cada pasada.

### Índices evaluados
Ajustados a las consultas reales implementadas en `IncidentService`:
- `idx_incidents_status_lower_category_created_at` sobre `(status, lower(category), created_at DESC)` (optimiza `GET /api/incidents?status=REPORTED&category=STREET`).
- `idx_incidents_created_at` sobre `(created_at DESC)` (optimiza paginación profunda y ordenación global).

### Comparativa de latencias $p95$ (Medias de 3 pasadas por configuración)

| Volumen | Estado | Consulta Filtrada | Paginación Profunda | Consulta Analítica | Escritura (`POST`) | Modificación (`PATCH`) | Estado SLO |
|---|---|---:|---:|---:|---:|---:|:---:|
| **1.000 filas** | Sin índices | 15,44 ms | 10,92 ms | 15,60 ms | 17,64 ms | 7,96 ms | CUMPLE |
| | **Con índices** | **12,51 ms** | **10,10 ms** | 17,46 ms | 18,65 ms | 10,53 ms | CUMPLE |
| **10.000 filas** | Sin índices | 21,67 ms | 14,97 ms | 25,92 ms | 16,98 ms | 8,25 ms | CUMPLE |
| | **Con índices** | **12,54 ms** | **12,13 ms** | 31,82 ms | 18,35 ms | 8,93 ms | CUMPLE |
| **100.000 filas** | Sin índices | 254,17 ms | 101,33 ms | 199,47 ms | 44,09 ms | 22,84 ms | CUMPLE |
| | **Con índices** | **23,45 ms** | **23,38 ms** | 229,58 ms | 26,28 ms | 19,25 ms | **MEJORA >90%** |
| **1.000.000 filas** | Sin índices | 6.039,89 ms | 1.443,66 ms | 5.967,89 ms | 1.832,75 ms | 1.426,53 ms | **INCUMPLE SLO** |
| | **Con índices** | **3.235,62 ms** | **186,56 ms** | 5.353,46 ms | 1.151,36 ms | 973,17 ms | **RECUPERA SLO EN PAGINACIÓN** |

```mermaid
xychart-beta
    title "Impacto de los Índices en Latencia p95 a 100k y 1M de Filas (ms)"
    x-axis ["Filtrada 100k", "Paginación 100k", "Paginación 1M"]
    y-axis "Latencia p95 (ms)" 0 --> 1600
    bar [254.2, 101.3, 1443.7]
    bar [23.5, 23.4, 186.6]
```

### Evidencia de planes de ejecución (`EXPLAIN ANALYZE BUFFERS`)
La verificación directa en el motor PostgreSQL sobre 1.000.000 de filas demuestra la raíz del cambio:
- **Consulta Filtrada y Paginación sin índices:**  
  Requiere `Parallel Seq Scan on incidents` (2 workers). Lee **21.653 buffers compartidos** en disco, tardando **114,31 ms** por consulta en base de datos.
- **Consulta con índices:**  
  Utiliza `Index Scan using idx_incidents_created_at`. Lee únicamente **6 buffers**, tardando **0,51 ms** por consulta.

### Respuesta a la pregunta arquitectónica
> **¿Mejorar el esquema de PostgreSQL permite aumentar la capacidad sin modificar el número de instancias de Spring Boot?**

**SÍ, de forma rotunda y medible.**
1. **Eliminación del cuello de botella en lectura:** A 100.000 registros, la indexación reduce el tiempo de respuesta de la consulta filtrada de 254 ms a 23 ms (una reducción del 90,8%). A 1.000.000 de registros, la paginación profunda pasa de tardar 1.443 ms (incumpliendo el SLO) a **186 ms**, volviendo a entrar en el objetivo de servicio sin tocar la infraestructura.
2. **Impacto en el pool de conexiones:** Al durar las consultas de base de datos 0,5 ms en vez de 114 ms, las conexiones de HikariCP se liberan 200 veces más rápido. Esto evita que el pool de 10 conexiones se sature, permitiendo al mismo proceso Spring Boot atender una tasa de usuarios concurrentes notablemente mayor.
3. **Escrituras y modificaciones concurrentes:** Aunque mantener índices introduce un coste teórico de actualización en disco al insertar (`POST`) o modificar (`PATCH`), en la práctica a volúmenes altos (100k–1M) la reducción radical de la contención en el disco y en el pool de conexiones beneficia también a las escrituras, reduciendo su $p95$ en un 37% (de 1.832 ms a 1.151 ms).

---

## 6. Trazabilidad con la revisión de la PR #70

| Observación del revisor (PR #70) | Tipo | Acción implementada y evidencia |
|---|:---:|---|
| **Observabilidad con Micrometer/Prometheus** | Bloqueante | Añadidos `spring-boot-starter-actuator` y `micrometer-registry-prometheus` a `pom.xml`, configurado en `application.properties` y provisionado stack Docker con Prometheus y Grafana. Métricas cruzadas en el informe. |
| **SLO y umbrales de latencia** | Bloqueante | Añadidos thresholds explícitos en los cuatro scripts: $p(95) < 500\text{ ms}$, errores HTTP $< 1\%$ y `dropped_iterations == 0`. |
| **Saturación en Experimento 2** | Bloqueante | Exploradas tasas hasta 800 req/s con `constant-arrival-rate`, identificando el límite sostenible en 500 req/s y la saturación a partir de 600–700 req/s. |
| **Matriz de volumen en Experimento 4** | Bloqueante | Creados scripts SQL reproducibles (`seed-volume.sql`, `create-indexes.sql`, `drop-indexes.sql`, `explain-volume.sql`). Ejecutadas 3 pasadas por cada tamaño (1k, 10k, 100k, 1M) antes y después de indexar. |
| **Índice con `lower(category)`** | Bloqueante | Corregido el índice a `(status, lower(category), created_at DESC)` alineado con el predicado real de `IncidentService`. |
| **Etiquetado de fases en Experimento 3** | Recomendado | Separadas y etiquetadas las fases (`pre-pico`, `pico`, `recuperacion`) con tags de k6 para cuantificar el impacto y la recuperación. |
| **Control sin mapa en Experimento 3** | Recomendado | Añadida variante `control` (`INCLUDE_MAP=false`) con 3 pasadas frente a las 3 pasadas con mapa. |
| **Pico agresivo en Experimento 3** | Recomendado | El pico se elevó a 800 req/s para sobrepasar deliberadamente el límite de capacidad. |
| **Repeticiones (3 pasadas mínimas)** | Recomendado | Todos los experimentos (1, 2, 3 y 4) cuentan con al menos 3 ejecuciones documentando media y rangos. |
| **Explicación de `dropped_iterations`** | Recomendado | Documentado en la sección 1 explicando la causa del bloqueo de VUs. |
| **Modificación concurrente (`PATCH`)** | Recomendado | En el Experimento 4 se incorporó `PATCH /api/incidents/{id}` concurrente con las consultas y creaciones. |
| **Extracción de autenticación** | Recomendado | Código de login y CSRF desacoplado en el módulo reutilizable `pruebas/k6/lib/auth.js`. |
| **Formato de commit** | Recomendado | Squash merge propuesto bajo Conventional Commits: `test: añade experimentos de rendimiento k6 (#70)`. |
