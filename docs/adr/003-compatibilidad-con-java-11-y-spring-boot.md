ADR-003: Compatibilidad con Java 11 y Spring Boot 2.7.x



**Estado**

Accepted



**Contexto**

La infraestructura de ejecución y despliegue del entorno objetivo exige mantener la ejecución sobre Java 11 LTS.



**Opciones consideradas**

1. Migrar a Java 17 y Spring Boot 3.x.

2\. Mantener Java 11 y fijar la versión en Spring Boot 2.7.18 junto a springdoc-openapi-ui 1.8.0.

3\. Utilizar versiones previas de Spring Boot (2.5.x o inferior).



**Decisión**

Fijar el proyecto en Java 11 y Spring Boot 2.7.18.



**Consecuencias**

\+ Compatibilidad garantizada con el entorno de ejecución objetivo sin fallos de compilación por versión de runtime.

\+ Estabilidad comprobada del ecosistema Spring Boot 2.7.



\- Imposibilidad de utilizar características de Java 17+ (como los Java Records nativos).

\- Obligación de mantener el espacio de nombres javax.\* en lugar del estándar jakarta.\*.

