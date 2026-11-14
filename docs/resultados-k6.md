# Resultados consolidados de pruebas k6 — UrbanPulse

**Fecha de cierre:** 14 de noviembre de 2026  
**Entorno:** backend Spring Boot local y PostgreSQL local; k6 2.3.0. Las peticiones se dirigen al backend; el frontend no interviene en las mediciones.

Este documento reúne los resultados de los cuatro experimentos y sirve como referencia para comparar futuras versiones. El experimento 2 tiene tres ejecuciones por configuración. Los experimentos 1, 3 y 4 tienen una ejecución completa cada uno y, por tanto, sus cifras son observaciones iniciales, no promedios estadísticos.

## Experimento 1: línea base de endpoints

**Ejecución:** 12 de noviembre de 2026, con 5.011 incidencias. Se usaron 10 VUs durante 2 minutos para cada operación.

| Operación | Peticiones | Peticiones/s | p50 | p95 | p99 | Errores HTTP |
|---|---:|---:|---:|---:|---:|---:|
| Listado paginado | 1.190 | 9,92 | 8,00 ms | 10,91 ms | 18,11 ms | 0 |
| Búsqueda de duplicados | 1.200 | 10,00 | 5,89 ms | 8,48 ms | 13,38 ms | 0 |
| Consulta de detalle | 1.200 | 10,00 | 5,02 ms | 6,92 ms | 9,72 ms | 0 |

El listado paginado fue la operación más lenta en los tres percentiles y tuvo ligeramente menos throughput. El p99 quedó por encima del p50 en todas las operaciones, especialmente en el listado. En esta pasada, el listado es el primer candidato para revisar, pero conviene repetir la medición antes de atribuir la diferencia a la consulta SQL o cambiar código.

## Experimento 2: capacidad y saturación

Cada configuración se ejecutó tres veces. La primera ejecución corresponde a la medición documentada del 12 de noviembre, con 5.011 incidencias; las dos repeticiones se ejecutaron el 14 de noviembre, con 5.010 incidencias. El endpoint fue el listado paginado de incidencias y la base no recibió escrituras durante estas pruebas.

La tabla muestra la media de las tres ejecuciones. Entre paréntesis aparece el mínimo y máximo de los valores calculados en cada ejecución; no es un intervalo de confianza. Los percentiles son la media de los p50, p95 y p99 de cada pasada, no percentiles calculados sobre muestras combinadas.

| Perfil | Peticiones por pasada, media (rango) | Tasa media (rango) | p50 medio (rango) | p95 medio (rango) | p99 medio (rango) | Errores HTTP / descartes |
|---|---:|---:|---:|---:|---:|---:|
| VUs crecientes: 10, 25, 50 y 100 | 16.534 (16.530–16.538) | 42,33 req/s (42,29–42,38) | 6,24 ms (6,07–6,48) | 8,63 ms (8,19–8,93) | 10,27 ms (9,30–10,82) | 0 / no aplica |
| Tasa constante: 10 iteraciones/s | 601 (601–601) | 10,01 req/s (10,01–10,02) | 8,28 ms (7,95–8,55) | 10,48 ms (9,78–10,97) | 11,00 ms (10,13–11,53) | 0 / 0 |
| Tasa constante: 25 iteraciones/s | 1.500,67 (1.500–1.501) | 25,01 req/s (25,00–25,01) | 7,63 ms (7,37–7,95) | 9,56 ms (8,95–10,02) | 10,35 ms (9,65–10,73) | 0 / 0 |
| Tasa constante: 50 iteraciones/s | 3.000,67 (3.000–3.001) | 50,01 req/s (50,00–50,01) | 6,60 ms (6,55–6,64) | 7,78 ms (7,71–7,92) | 8,33 ms (8,22–8,49) | 0 / 0 |
| Tasa constante: 100 iteraciones/s | 6.001 (6.001–6.001) | 100,01 req/s (100,01–100,01) | 4,81 ms (4,54–4,98) | 6,51 ms (6,29–6,67) | 7,79 ms (7,14–8,50) | 0 / 0 |
| Tasa creciente: 10 a 100 iteraciones/s | 9.899,33 (9.899–9.900) | 36,66 req/s (36,66–36,67) | 6,27 ms (6,05–6,47) | 8,83 ms (8,66–8,97) | 10,06 ms (9,93–10,15) | 0 / 0 |

Los checks pasaron al 100 % en las tres pasadas de todas las configuraciones. En los perfiles de tasa constante y creciente, `dropped_iterations` fue 0 en las tres pasadas. El perfil de VUs usa `ramping-vus`, por lo que `dropped_iterations` no es aplicable a ese ejecutor.

**Conclusiones:** el listado sostuvo 100 iteraciones/s en las tres pasadas, sin errores HTTP ni iteraciones descartadas. No se encontró un punto de degradación dentro del rango ensayado; 100 iteraciones/s no debe presentarse como capacidad máxima. Las latencias menores observadas en algunos perfiles de tasa alta no prueban que el aumento de carga mejore el servicio: pueden influir el calentamiento de la aplicación o de la caché. La práctica no define un SLO del proyecto, así que estos resultados no se comparan con un límite de latencia inventado.

## Experimento 3: pico de incidencias urbanas

**Ejecución:** 14 de noviembre de 2026. Se combinaron 30 VUs consultando el mapa durante 3 min 30 s y un perfil de creación de 3 minutos que sube hasta 60 iteraciones/s y luego baja a 2 iteraciones/s. La base tenía 5.014 incidencias al inicio y 10.593 al final; se insertaron 5.579 incidencias.

| Operación | Peticiones | Throughput del tramo | p50 | p95 | p99 | Errores HTTP |
|---|---:|---:|---:|---:|---:|---:|
| Consulta del mapa (`GET /api/incidents`) | 6.270 | 29,86 req/s (210 s) | 7,04 ms | 13,00 ms | 22,52 ms | 0 |
| Creación (`POST /api/incidents`) | 5.579 | 31,00 req/s (180 s) | 8,57 ms | 15,55 ms | 21,68 ms | 0 |

Los 11.851 checks pasaron, no hubo fallos HTTP y `dropped_iterations` fue 0. Las 11.851 peticiones incluyen el login y la obtención del token CSRF; las iteraciones de los escenarios fueron 11.849.

En esta pasada el sistema atendió la carga sin errores. El resumen agrega todas las fases, por lo que no permite aislar la latencia durante el pico ni cuantificar la recuperación. Tampoco se midieron CPU, HikariCP o Tomcat; no se atribuyen los resultados a esos componentes. No se ejecutó el experimento 1 completo en las mismas condiciones, así que no se calcula el aumento respecto a una línea base comparable.

## Experimento 4: volumen e indexación

**Ejecución:** 14 de noviembre de 2026, con 15 VUs y cuatro bloques de 60 segundos. La base tenía 10.593 filas al inicio y 11.493 al final; el bloque de escritura añadió 900 incidencias. Fue una sola pasada, sin comparar configuraciones antes y después de añadir índices.

La consulta agregada se hizo con `GET /api/analytics/summary`, que calcula recuentos desde PostgreSQL. Se sustituyó la antigua llamada a `/api/opendata/incidents`: el backend carga ese recurso desde un CSV estático y no sirve para medir el volumen de la tabla `incidents`.

| Operación | Peticiones | Throughput del bloque | p50 | p95 | p99 | Errores HTTP |
|---|---:|---:|---:|---:|---:|---:|
| Filtrado y ordenación | 900 | 15,00 req/s | 13,61 ms | 20,00 ms | 27,86 ms | 0 |
| Paginación profunda (`page=50`) | 900 | 15,00 req/s | 10,84 ms | 16,01 ms | 19,94 ms | 0 |
| Agregados PostgreSQL | 885 | 14,75 req/s | 21,74 ms | 33,85 ms | 40,32 ms | 0 |
| Escritura concurrente | 900 | 15,00 req/s | 14,84 ms | 21,09 ms | 25,55 ms | 0 |

Pasaron los 3.587 checks y no hubo fallos HTTP. El throughput por operación se calculó dividiendo sus peticiones entre los 60 segundos del bloque; la tasa global de un `Counter` en k6 usa la duración completa del experimento.

Estas cifras son una referencia para un conjunto de unas 10.600 filas, no una conclusión sobre el efecto de los índices ni del aumento de volumen. Para comparar índices hay que repetir las mediciones sobre el mismo número de filas, antes y después del cambio, con tres pasadas por configuración.

## Uso como referencia y límites

- Para comparar cambios del experimento 2, usa las medias y rangos de las tres pasadas y conserva los mismos perfiles, duración, backend, máquina y volumen de datos. Las tres ejecuciones incluidas difieren en una fila entre la pasada histórica y las dos nuevas.
- El experimento 1 tiene una sola pasada; sus percentiles son una línea base inicial y conviene repetirlo tres veces antes de atribuir variaciones a un cambio de código.
- Los experimentos 3 y 4 tienen una pasada cada uno. Ambos escriben filas persistentes: la configuración habitual puede insertar unas 5.500 en el 3 y 900 en el 4. Ejecútalos en una base aislada o restaurable si vas a repetirlos.
- El volumen del experimento 4 no llegó a 100.000 filas ni se hizo una comparación controlada de índices en esta medición. No uses sus cifras para afirmar mejoras por indexación.
- Todas las cifras son de entorno local; no equivalen a capacidad de producción. Los resúmenes JSON temporales de k6 no se conservan porque incluyen cookies de sesión y tokens CSRF.

Los comandos y requisitos de ejecución están en [`pruebas/k6/README.md`](../pruebas/k6/README.md).
