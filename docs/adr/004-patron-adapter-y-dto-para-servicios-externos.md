ADR-004: Patrón Adapter y DTO para Servicios Externos



**Estado**

Accepted



**Contexto**

La aplicación debe consultar y exponer datos de contexto urbano y geolocalización provenientes de fuentes externas, aislando el modelo de dominio interno.



**Opciones consideradas**

1. Exponer directamente las entidades JPA del dominio en la API REST.

2\. Implementar el patrón Adapter junto a objetos DTO para la comunicación externa.

3\. Consumir las APIs externas directamente desde el frontend sin pasar por el backend.



**Decisión**

Implementar adaptadores en la capa external/ y comunicar el API mediante DTOs dedicados (IncidentResponse, LocationResponse).



**Consecuencias**

\+ Desacoplamiento total entre las entidades del dominio de datos y las APIs de clientes o servicios externos.

\+ Mayor flexibilidad ante cambios en proveedores de mapas o servicios de contexto urbano.



\- Incremento en el número de clases y mapas de transformación de objetos en el backend.

\- Ligera sobrecarga en la conversión de entidades a DTOs en cada petición.

