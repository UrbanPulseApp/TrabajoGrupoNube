# Contexto del Proyecto: UrbanPulse

## 1. Descripción y Propósito
UrbanPulse es una plataforma cloud para la gestión inteligente de incidencias urbanas que integra reportes de la ciudadanía con datos contextuales de la ciudad de Málaga.
* **Arquitectura:** Monolito en Spring Boot (backend) + React con Vite (frontend) + PostgreSQL.
* **Documentación técnica:** Modelo C4 (`docs/diagrama-C4/`) y ADRs en `docs/adr/`.

## 2. Dominio y Seguridad
* **Identificadores Opacos (UUID):** Claves primarias (`User`, `Incident`, `Assignment`, `Attachment`, `StatusChange`) en `UUID` para evitar vulnerabilidades IDOR.
* **Entidad central:** `Incident` con ciclo de vida: `REPORTED`, `VALIDATED`, `REJECTED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `REOPENED`, `CLOSED`.
* **Degradación Controlada:** Si las fuentes externas (clima, activos, tráfico) no responden, la incidencia se registra con datos de reserva (*fallback*).

## 3. API REST y Endpoints Clave
* **Design-First y DTOs:** Uso obligatorio de DTOs para aislar la base de datos de la interfaz.
* **Prevención de Duplicados:** Endpoint `GET /api/incidents/duplicates` por radio métrico y *bounding box*.
* **Cuadro de Mando:** Endpoint `GET /api/analytics/summary` restringido a roles `ANALYST`, `OPERATOR` y `ADMIN`.
* **Errores Estandarizados:** Uso de `@RestControllerAdvice` con DTO `ApiError` y cabecera de trazabilidad `X-Request-ID`.

## 4. Instrucciones para la IA
* Respeta la arquitectura por capas (`controller`, `service`, `repository`, `entity`, `dto`, `exception`).
* No introduzcas microservicios ni herramientas complejas innecesarias (*Keep It Simple*).