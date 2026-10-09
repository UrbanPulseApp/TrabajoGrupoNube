ADR-001: Adopción de Arquitectura Monorepo Desacoplada



**Estado**

Accepted



**Contexto**

Se requiere desarrollar una aplicación para la gestión de incidencias urbanas que cuente con una interfaz interactiva de usuario (mapas, listados y formularios) y un backend robusto para la lógica de negocio y persistencia de datos. Necesitamos una estructura que facilite el trabajo colaborativo sin complejizar el despliegue.



**Opciones consideradas**
1. Repositorios independientes para backend y frontend.

2\. Monolito tradicional (Spring Boot rindiendo plantillas JSP).

3\. Monorepo desacoplado (Spring Boot + React).



**Decisión**

Adoptar un Monorepo desacoplado con React en el frontend y Spring Boot en el backend.



**Consecuencias**

\+ Simplificación del control de versiones al mantener todo el código del proyecto en un único repositorio Git.

\+ Gestión unificada de los pipelines de integración y despliegue continuo.



\- Necesidad de configurar rutas de compilación personalizadas en el pom.xml.

\- Posible incremento en el tamaño total del repositorio al compartir historial.

