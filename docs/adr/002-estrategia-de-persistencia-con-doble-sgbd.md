ADR-002: Estrategia de Persistencia con Doble SGBD



**Estado**

Accepted



**Contexto**

Se necesita agilizar los desarrollos locales y las pruebas integradas con una base de datos en memoria, manteniendo la capacidad de despliegue en producción sobre un motor relacional persistente.



**Opciones consideradas**

1. Uso exclusivo de PostgreSQL tanto en desarrollo local como en producción.

2\. Capa de abstracción con JPA/Hibernate empleando Apache Derby en local/test y PostgreSQL en producción.

3\. Base de datos NoSQL para almacenamiento directo de incidencias.



**Decisión**

Utilizar JPA con Apache Derby para entorno local y PostgreSQL para producción.



**Consecuencias**

\+ Permite ejecutar la aplicación y los tests de integración rápidamente sin levantar infraestructura externa en local.

\+ Transición transparente entre motores de base de datos mediante la capa ORM.



\- Restricción en el uso de SQL nativo propio de PostgreSQL para no romper la compatibilidad con Derby.

\- Riesgo de discrepancias menores en el comportamiento de tipos de datos entre ambos motores.

