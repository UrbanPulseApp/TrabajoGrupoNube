# Resultados de pruebas k6: experimentos 3 y 4

**Fecha de ejecución:** 13 de noviembre de 2026  
**Estado:** resultados consolidados; se realizaron tres ejecuciones independientes por configuración principal.

Este documento recoge las mediciones obtenidas con los scripts de [`pruebas/k6`](../pruebas/k6/README.md) y responde a las preguntas de los experimentos 3 y 4 de la práctica. Las pruebas se ejecutaron contra el backend Spring Boot local y PostgreSQL, con 27.047 incidencias en la base de datos. No se inició el frontend.

## Experimento 3: simulación de un pico de incidencias urbanas

Se simuló un episodio de lluvias intensas en Málaga durante 3 minutos y 30 segundos combinando dos escenarios simultáneos: 30 VUs constantes consultando el listado de incidencias del mapa (`GET /api/incidents?page=0&size=50&sort=-createdAt`) y un perfil `ramping-arrival-rate` que parte de 2 iteraciones/s, sube bruscamente a 60 iteraciones/s en 15 segundos (manteniendo el pico durante 1 minuto y 15 segundos) y desciende de nuevo a 2 iteraciones/s para observar la recuperación.

Se ejecutaron tres pasadas completas. En la tabla se muestra la media de las tres ejecuciones junto con el rango entre el valor mínimo y el máximo observados:

| Escenario / Operación | Peticiones por pasada | Peticiones/s (media) | p50 media (rango) | p95 media (rango) | p99 media (rango) | Errores HTTP | `dropped_iterations` |
|---|---:|---:|---:|---:|---:|---:|---:|
| Consulta de mapa (`GET /api/incidents`) | 6.270 | 29,74 | 5,92 ms (4,78 - 6,86) | 10,08 ms (8,56 - 11,78) | 26,54 ms (16,80 - 43,21) | 0 % (0) | 0 |
| Creación de incidencias (`POST /api/incidents`) | 5.579 | 26,47 | 6,95 ms (6,47 - 7,42) | 9,73 ms (8,07 - 12,42) | 20,55 ms (9,86 - 41,54) | 0 % (0) | 0 |
| **Total global del experimento** | **11.851** | **56,22** | **6,74 ms (6,29 - 6,97)** | **9,94 ms (8,22 - 12,19)** | **23,37 ms (13,34 - 42,15)** | **0 % (0)** | **0** |

### Respuestas

1. **¿Aparecen errores durante el pico?** No. En las tres repeticiones se completaron las 11.851 peticiones HTTP con un 0 % de errores y el 100 % de los checks superados (superando el umbral del 95 %). Tampoco se descartaron iteraciones (`dropped_iterations = 0`).
2. **¿Cuánto aumenta la latencia?** El incremento durante la ráfaga de 60 iteraciones/s es muy moderado. Respecto a la línea base de lectura del experimento 1 (p50 de 8,00 ms y p95 de 10,91 ms con 10 VUs), la consulta del mapa mantuvo una mediana media de 5,92 ms y un p95 medio de 10,08 ms. Solo en el percentil p99 se observaron picos puntuales de hasta 43,21 ms en lectura y 41,54 ms en escritura en la segunda ejecución, asociados a pausas breves de recolección de basura o escritura en disco.
3. **¿El servicio recupera su comportamiento normal al desaparecer la sobrecarga?** Sí. Al caer la tasa de llegada de 60 a 2 iteraciones/s en el tramo final de 1 minuto y 15 segundos, el sistema absorbió el cambio sin acumulación de peticiones en cola ni degradación residual en las consultas del mapa.
4. **Pregunta arquitectónica: ¿Qué ocurre con la creación de incidencias si al mismo tiempo hay muchos usuarios consultando el mapa de incidencias?** Ambas operaciones comparten el pool de conexiones HikariCP de Spring Boot, los hilos de Tomcat y los recursos de PostgreSQL. Sin embargo, gracias al control de concurrencia multiversión (MVCC) de PostgreSQL, las lecturas del mapa no bloquean las inserciones de nuevas incidencias ni viceversa. Con 30 lectores concurrentes y hasta 60 escrituras/s, el pool de conexiones y la CPU local gestionaron ambos flujos sin contención apreciable (p95 inferior a 13 ms en todas las pasadas).
5. **Variabilidad y métrica `dropped_iterations`:** La variabilidad entre las tres repeticiones fue baja en p50 y p95 (diferencias inferiores a 4,5 ms), concentrándose la dispersión únicamente en el p99. La métrica `dropped_iterations` fue 0 en las tres ejecuciones, lo que indica que k6 dispuso en todo momento de VUs libres dentro del límite configurado (`maxVUs = 120`) y que el servidor no retuvo las peticiones lo suficiente como para impedir el inicio puntual de las iteraciones programadas.

## Experimento 4: influencia del volumen de datos e indexación

Para evaluar el efecto del tamaño de la tabla `incidents` en el entorno local disponible, se probaron dos volúmenes representativos: una base intermedia con **21.747 incidencias** y una base escalada a **99.947 incidencias** (aproximadamente 100.000 registros). En cada escenario se ejecutaron cuatro operaciones con 15 VUs concurrentes durante 1 minuto por bloque: consulta filtrada y ordenada (`GET /api/incidents?status=REPORTED&category=STREET&page=0&size=20&sort=-createdAt`), paginación profunda (`GET /api/incidents?page=50&size=20&sort=-createdAt`), estadísticas agregadas/exportación completa (`GET /api/opendata/incidents`) y escritura concurrente (`POST /api/incidents`).

Tras medir el volumen de 99.947 incidencias sin índices adicionales (3 repeticiones), se crearon dos índices B-tree en PostgreSQL sobre los campos filtrados y ordenados y se repitieron otras 3 ejecuciones:

```sql
CREATE INDEX idx_incidents_status_category_created ON incidents (status, category, created_at DESC);
CREATE INDEX idx_incidents_created_at ON incidents (created_at DESC);
ANALYZE incidents;
```

### Evolución por volumen de datos (sin índices adicionales)

| Operación | Volumen | Peticiones/s | p50 media (rango) | p95 media (rango) | p99 media (rango) | Errores HTTP |
|---|---|---:|---:|---:|---:|---:|
| Consulta filtrada y ordenada | 21.747 filas (1 pasada) | 3,52 | 11,15 ms | 17,65 ms | 170,42 ms | 0 % |
| Consulta filtrada y ordenada | 99.947 filas (3 pasadas) | 3,46 | 26,22 ms (25,21 - 27,63) | 35,02 ms (33,13 - 35,98) | 45,99 ms (39,91 - 57,99) | 0 % |
| Paginación profunda (`page=50`) | 21.747 filas (1 pasada) | 3,52 | 10,10 ms | 12,30 ms | 16,51 ms | 0 % |
| Paginación profunda (`page=50`) | 99.947 filas (3 pasadas) | 3,46 | 20,66 ms (20,35 - 21,08) | 26,76 ms (25,11 - 27,92) | 33,87 ms (29,68 - 36,53) | 0 % |
| Consulta OpenData (sin paginar) | 21.747 filas (1 pasada) | 3,35 | 63,94 ms | 91,07 ms | 116,30 ms | 0 % |
| Consulta OpenData (sin paginar) | 99.947 filas (3 pasadas) | 3,37 | 48,62 ms (40,23 - 61,39) | 77,67 ms (76,06 - 78,83) | 84,76 ms (83,75 - 86,20) | 0 % |
| Escritura concurrente (`POST`) | 21.747 filas (1 pasada) | 3,52 | 10,30 ms | 12,96 ms | 27,16 ms | 0 % |
| Escritura concurrente (`POST`) | 99.947 filas (3 pasadas) | 3,52 | 10,80 ms (10,21 - 11,91) | 12,94 ms (12,07 - 14,44) | 22,56 ms (15,22 - 34,15) | 0 % |

### Comparativa antes y después de indexar (~100.000 incidencias, 3 repeticiones)

| Operación | Configuración | Peticiones/s | p50 media (rango) | p95 media (rango) | p99 media (rango) | Variación p95 |
|---|---|---:|---:|---:|---:|---:|
| Consulta filtrada y ordenada | Sin índices | 3,46 | 26,22 ms (25,21 - 27,63) | 35,02 ms (33,13 - 35,98) | 45,99 ms (39,91 - 57,99) | — |
| Consulta filtrada y ordenada | **Con índices** | **3,52** | **15,19 ms (15,18 - 15,21)** | **18,56 ms (18,35 - 18,93)** | **21,75 ms (20,57 - 23,34)** | **-47,0 %** |
| Paginación profunda (`page=50`) | Sin índices | 3,46 | 20,66 ms (20,35 - 21,08) | 26,76 ms (25,11 - 27,92) | 33,87 ms (29,68 - 36,53) | — |
| Paginación profunda (`page=50`) | **Con índices** | **3,52** | **10,73 ms (10,65 - 10,86)** | **12,81 ms (12,50 - 13,42)** | **15,66 ms (13,71 - 18,32)** | **-52,1 %** |
| Consulta OpenData (sin paginar) | Sin índices | 3,37 | 48,62 ms (40,23 - 61,39) | 77,67 ms (76,06 - 78,83) | 84,76 ms (83,75 - 86,20) | — |
| Consulta OpenData (sin paginar) | **Con índices** | **3,35** | **61,95 ms (60,68 - 62,78)** | **78,51 ms (77,19 - 79,32)** | **84,99 ms (83,16 - 86,20)** | **+1,1 %** |
| Escritura concurrente (`POST`) | Sin índices | 3,52 | 10,80 ms (10,21 - 11,91) | 12,94 ms (12,07 - 14,44) | 22,56 ms (15,22 - 34,15) | — |
| Escritura concurrente (`POST`) | **Con índices** | **3,52** | **11,21 ms (10,86 - 11,88)** | **13,80 ms (13,13 - 15,00)** | **17,25 ms (15,66 - 18,19)** | **+6,6 %** |

### Respuestas

1. **¿Cómo evoluciona el rendimiento de consultas filtradas, paginación, ordenación por fecha y estadísticas agregadas al aumentar el volumen?** Sin índices adicionales, multiplicar por 4,6 el número de registros (de 21.747 a 99.947 filas) más que duplicó la latencia mediana de las consultas paginadas: la consulta filtrada y ordenada pasó de 11,15 ms a 26,22 ms en p50 (y de 17,65 ms a 35,02 ms en p95), mientras que la paginación profunda pasó de 10,10 ms a 20,66 ms en p50. Esto ocurre porque PostgreSQL debe ejecutar un barrido secuencial (`Seq Scan`) y ordenar en memoria toda la tabla antes de recortar la página. Por su parte, `GET /api/opendata/incidents` es la operación más lenta en todos los volúmenes (p95 entre 77 ms y 91 ms) porque devuelve todos los registros sin paginación, transfiriendo cerca de 980 MB por ejecución.
2. **¿Qué efecto tiene añadir índices sobre los campos habitualmente filtrados y ordenados?** La mejora es inmediata y muy consistente entre repeticiones. El índice compuesto `(status, category, created_at DESC)` resolvió el filtrado y la ordenación en un único recorrido ordenado, reduciendo el p95 de la consulta filtrada en un 47,0 % (de 35,02 ms a 18,56 ms) y estabilizando su mediana en 15,19 ms. De forma análoga, el índice `(created_at DESC)` evitó ordenar 100.000 filas en cada salto de página, reduciendo el p95 de la paginación profunda en un 52,1 % (de 26,76 ms a 12,81 ms) y devolviendo los tiempos prácticamente al nivel de una tabla con cinco veces menos datos.
3. **¿Cómo afecta la indexación a las operaciones de escritura concurrente?** Mantener los dos índices B-tree adicionales supone actualizar sus estructuras en cada `INSERT`. En las mediciones, el impacto fue mínimo: el p50 de `POST /api/incidents` aumentó apenas 0,41 ms (de 10,80 ms a 11,21 ms, un +3,8 %) y el p95 aumentó 0,86 ms (de 12,94 ms a 13,80 ms, un +6,6 %), un coste muy bajo frente al beneficio obtenido en lectura.
4. **Pregunta arquitectónica: ¿Mejorar el esquema de PostgreSQL permite aumentar la capacidad sin modificar el número de instancias de Spring Boot?** Sí. Al reducir a la mitad el tiempo de respuesta de las consultas SQL en PostgreSQL, cada hilo de Tomcat y cada conexión del pool HikariCP quedan libres mucho antes para atender nuevas peticiones. De este modo, la misma instancia única de Spring Boot aumenta su capacidad efectiva y tolerancia a la concurrencia sin necesidad de escalar horizontalmente ni añadir más réplicas del backend. No obstante, el experimento también demuestra que los índices no resuelven cuellos de botella de diseño de API: en `GET /api/opendata/incidents`, al no existir paginación ni caché, el coste reside en la serialización JSON y el volumen de red, no en el acceso a disco.
5. **Variabilidad y `dropped_iterations`:** Tras crear los índices, la dispersión entre pasadas en lectura se redujo drásticamente (por ejemplo, el p50 de la consulta filtrada osciló solo entre 15,18 ms y 15,21 ms). Todos los escenarios del experimento 4 utilizaron ejecutores `constant-vus` con pausa de 1 segundo entre iteraciones y completaron el 100 % de las peticiones sin errores ni iteraciones descartadas.

## Limitaciones y siguientes mediciones

En el experimento 4, el volumen intermedio de 21.747 incidencias se midió en una única pasada de referencia, mientras que las configuraciones críticas de ~100.000 incidencias (antes y después de indexar) y el experimento 3 sí cuentan con tres repeticiones independientes. Además, los volúmenes ensayados se ajustaron a los recursos locales de la máquina de pruebas (llegando hasta 100.000 registros en lugar de 1.000.000).

Como trabajo futuro para producción, conviene incorporar paginación o caché HTTP en `/api/opendata/incidents` para evitar transferencias masivas por petición, y validar los planes de ejecución (`EXPLAIN ANALYZE`) cuando se combinen filtros de texto libre (`q`) o búsquedas geográficas por radio.