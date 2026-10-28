# ADR-04: Estrategia de Degradación Controlada frente a Fallos en Fuentes Externas

- **Asunto (Issue):** 
  El sistema UrbanPulse consume datos contextuales de la ciudad de Málaga (clima, tráfico, alertas ambientales) de APIs externas para enriquecer los reportes (RF23, Issue #17)[cite: 1, 3].
  Debemos abordar esta decisión ahora para garantizar que indisponibilidades, latencias altas o caídas de los servicios externos no bloqueen el flujo principal de creación y almacenamiento de incidencias reportadas por los ciudadanos (RF03, RF26, Issue #24)[cite: 1, 3].

- **Decisión (Decision):** 
  Implementar el patrón **Adapter / Fallback (Degradación Controlada)** en el paquete `com.urbanpulse.external`. Si una API de contexto no responde o devuelve error dentro de un tiempo de espera (*timeout*), el sistema captura la excepción de forma transparente, asigna un valor por defecto (*mock/null context*) y permite que la incidencia se guarde correctamente en PostgreSQL[cite: 1, 2, 3].

- **Estado (Status):** 
  Decidida[cite: 1, 2].

- **Grupo (Group):** 
  Integración / Resiliencia[cite: 1, 2].

- **Supuestos (Assumptions):** 
  - La información de contexto externo (clima, tráfico) es un valor añadido (*enriquecimiento*) y no un requisito obligatorio para la existencia del reporte de la incidencia[cite: 3].
  - El timeout para llamadas externas HTTP no debe superar los 2 segundos para no degradar la experiencia de usuario en el frontend[cite: 1, 3].

- **Restricciones (Constraints):** 
  - Obliga a envolver los clientes HTTP externos en bloques de manejo de errores o resiliencia.
  - Exige marcar explícitamente en el objeto `UrbanContext` si los datos provienen de una fuente en vivo o de un valor por defecto por degradación[cite: 3].

- **Posiciones (Positions):** 
  1. **Degradación Controlada con Adapter/Fallback (Seleccionada):** Capturar el fallo externamente y continuar la transacción principal del reporte[cite: 1, 3].
  2. **Transacción acoplada sincrónica:** Cancelar el registro de la incidencia si la API externa no responde (Rechazada por violar la pauta de diseño de UrbanPulse)[cite: 2, 3].

- **Argumento (Argument):** 
  Sigue de forma estricta la pauta explícita del proyecto: *"Los datos externos enriquecen; nunca bloquean la creación del reporte si una fuente no está disponible"* (RF26)[cite: 3]. Garantiza una alta disponibilidad operativa del canal de la ciudadanía[cite: 3].

- **Implicaciones (Implications):** 
  - Requiere implementar clases adaptadoras (`WeatherAdapter`, `TrafficAdapter`) en `com.urbanpulse.external` (Issue #17)[cite: 1].
  - El frontend React recibirá una respuesta HTTP 201 Created independientemente del estado de las APIs externas[cite: 1, 3].

- **Decisiones relacionadas (Related decisions):** 
  - *ADR-02:* Uso de Spring Boot y API REST en el Backend[cite: 1, 2, 3].

- **Requisitos relacionados (Related requirements):** 
  - **RF03:** Registrar incidencia[cite: 1, 3].
  - **RF23:** Contexto externo[cite: 3].
  - **RF26:** Degradación controlada[cite: 3].

- **Artefactos relacionados (Related artifacts):** 
  - Paquete `com.urbanpulse.external` y DTOs de contexto (Issue #17, #24)[cite: 1].
  - Entidad/Concepto `UrbanContext` y `ExternalObservation`[cite: 3].

- **Principios relacionados (Related principles):** 
  - **Alta disponibilidad e independencia de fallos:** Los fallos en subsistemas externos no deben propagarse al núcleo transaccional[cite: 2, 3].

- **Notas (Notes):** 
  Decisión alineada con las tareas trabajadas en las Issues #17 y #24 del repositorio de GitHub[cite: 1].