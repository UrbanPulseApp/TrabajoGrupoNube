ADR-005: Manejo Centralizado de Excepciones con @ControllerAdvice



**Estado**

Accepted



**Contexto**

Las excepciones no controladas durante la ejecución REST generan trazas de código sensibles en el servidor y respuestas inconsistentes hacia el cliente frontend.



**Opciones consideradas**

1. Capturar excepciones individualmente dentro de cada método de los controladores.

2\. Implementar un manejador global mediante @ControllerAdvice (GlobalExceptionHandler).

3\. Delegar la gestión de errores en la configuración por defecto de Spring Boot.



**Decisión**

Utilizar un GlobalExceptionHandler centralizado para interceptar excepciones y retornar respuestas JSON estructuradas.



**Consecuencias**

\+ Formato de error estandarizado y predecible para el cliente frontend.

\+ Eliminación de trazas de código internas expuestas en las respuestas HTTP por seguridad.



\- Requisito de mantener actualizado el manejador global para cada nueva excepción personalizada.

\- Posible ocultamiento no deseado de errores si no se registra el log adecuado en el servidor.

