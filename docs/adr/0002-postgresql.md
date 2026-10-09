\# 2. Selección de PostgreSQL como Base de Datos Principal



\* \*\*Estado:\*\* Aceptado

\* \*\*Fecha:\*\* 2026-10-09



\## Contexto

UrbanPulse requiere almacenar datos relacionales con integridad referencial (usuarios, incidencias, asignaciones) y soporte para consultas geográficas de coordenadas.



\## Decisión

Se selecciona PostgreSQL 16 por su robustez, soporte SQL estándar y capacidades geoespaciales.



\## Consecuencias

\* \*\*Positivas:\*\* Modelo de datos consistente, amplia integración con Spring Data JPA.

\* \*\*Negativas:\*\* Requiere gestión de esquemas e índices relacionales.

