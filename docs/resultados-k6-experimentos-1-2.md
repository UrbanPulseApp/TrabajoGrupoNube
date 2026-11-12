# Resultados de pruebas k6: experimentos 1 y 2

**Fecha de ejecución:** 12 de noviembre de 2026  
**Estado:** resultados iniciales; se realizó una ejecución por configuración.

Este documento recoge las mediciones obtenidas con los scripts de [`pruebas/k6`](../pruebas/k6/README.md) y responde a las preguntas de los experimentos 1 y 2 de la práctica. Las pruebas se ejecutaron contra el backend Spring Boot local y PostgreSQL, con 5.011 incidencias en la base de datos. No se inició el frontend.

## Experimento 1: caracterización del rendimiento

Se midieron tres operaciones de lectura, con 10 VUs durante 2 minutos por operación. Se muestran la mediana como p50, los percentiles p95 y p99 y el throughput calculado como peticiones completadas dividido por 120 segundos.

| Operación | Peticiones | Peticiones/s | p50 | p95 | p99 | Errores HTTP |
|---|---:|---:|---:|---:|---:|---:|
| Listado paginado de incidencias | 1.190 | 9,92 | 8,00 ms | 10,91 ms | 18,11 ms | 0 |
| Búsqueda de duplicados | 1.200 | 10,00 | 5,89 ms | 8,48 ms | 13,38 ms | 0 |
| Detalle de incidencia | 1.200 | 10,00 | 5,02 ms | 6,92 ms | 9,72 ms | 0 |

### Respuestas

1. **¿Qué endpoint presenta mayor latencia?** El listado paginado fue el más lento: obtuvo el p50, p95 y p99 más altos. El p95 fue 10,91 ms y el p99, 18,11 ms.
2. **¿La operación más lenta también tiene menor throughput?** En esta ejecución el listado registró 9,92 peticiones/s, frente a 10,00 en las otras operaciones. La diferencia es pequeña y no permite atribuir un menor throughput a la latencia; los VUs esperan un segundo entre iteraciones y los bloques se ejecutan por separado.
3. **¿Hay diferencias entre p50 y p99?** Sí. El p99 supera al p50 en todas las operaciones, sobre todo en el listado (18,11 frente a 8,00 ms), lo que refleja una cola de peticiones más lentas. Las latencias absolutas observadas siguen siendo bajas en este entorno.
4. **¿Qué operación convendría optimizar primero?** El listado paginado es el candidato inicial por sus percentiles más altos. Antes de cambiar código, conviene revisar la consulta y su plan en PostgreSQL con datos representativos y confirmar la diferencia en varias ejecuciones.

## Experimento 2: capacidad y saturación

### VUs crecientes

Se aumentó progresivamente la concurrencia por niveles hasta 100 VUs. En el conjunto de la ejecución se obtuvieron 16.530 peticiones, 42,38 peticiones/s, p50 de 6,48 ms, p95 de 8,93 ms y p99 de 10,69 ms. Los checks pasaron al 100 % y no hubo errores HTTP. El máximo configurado de 100 VUs se alcanzó.

Estas métricas agregan todos los niveles de carga; no son percentiles separados por cada nivel de VUs.

### Tasa constante de iteraciones

| Tasa solicitada | Tasa obtenida | Peticiones | p50 | p95 | p99 | Errores | `dropped_iterations` |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 10 iteraciones/s | 10,01 peticiones/s | 601 | 8,55 ms | 10,97 ms | 11,53 ms | 0 % | 0 |
| 25 iteraciones/s | 25,00 peticiones/s | 1.500 | 7,95 ms | 10,02 ms | 10,73 ms | 0 % | 0 |
| 50 iteraciones/s | 50,01 peticiones/s | 3.001 | 6,64 ms | 7,92 ms | 8,49 ms | 0 % | 0 |
| 100 iteraciones/s | 100,01 peticiones/s | 6.001 | 4,54 ms | 6,29 ms | 8,50 ms | 0 % | 0 |

### Tasa creciente

El perfil `ramping-arrival-rate` subió progresivamente hasta 100 iteraciones/s. En total se completaron 9.899 peticiones, con una media de 36,66 peticiones/s, p50 de 6,05 ms, p95 de 8,87 ms y p99 de 10,15 ms. Hubo 0 % de errores y cero `dropped_iterations`.

### Respuestas

- **Capacidad observada:** el endpoint de listado sostuvo 100 iteraciones/s, además de alcanzar 100 VUs en el perfil de concurrencia, sin errores ni iteraciones descartadas.
- **Punto de degradación o incumplimiento:** no se alcanzó dentro del rango probado. Por tanto, el límite de capacidad queda por encima del máximo ensayado o no se detecta con este patrón y este entorno; no se debe presentar 100 iteraciones/s como capacidad máxima.
- **`dropped_iterations`:** fue 0 en todas las configuraciones de tasa constante y creciente. k6 pudo iniciar las iteraciones solicitadas con los VUs disponibles.
- **Criterio de latencia:** la práctica no fija un SLO específico del proyecto. Aunque el tutorial muestra p95 < 500 ms como ejemplo, no se considera aquí un requisito aprobado; los p95 medidos fueron inferiores a 11 ms.

## Limitaciones y siguientes mediciones

Estos resultados son orientativos porque cada configuración se ejecutó una sola vez, mientras que la práctica recomienda repetirla al menos tres veces y comparar la variabilidad. Las pruebas se realizaron en el entorno local y contra un único endpoint para el experimento 2; no representan por sí solas la capacidad de producción ni de todas las rutas. Además, la latencia observada disminuyó en las tasas más altas, lo cual puede deberse al calentamiento del proceso o de la caché y no demuestra que el aumento de carga mejore el rendimiento.

Para cerrar el análisis, repetir cada configuración tres veces con el mismo backend, base de datos y conjunto de datos; registrar media y dispersión; y ampliar la prueba por encima de 100 iteraciones/s solo si los recursos locales lo permiten.
