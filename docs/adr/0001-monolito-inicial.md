\# 1. Adopción de Arquitectura Monolítica Inicial



\* \*\*Estado:\*\* Aceptado

\* \*\*Fecha:\*\* 2026-10-09



\## Contexto

El equipo necesita desarrollar el MVP de la plataforma UrbanPulse garantizando velocidad de entrega, simplicidad en el despliegue y un modelo de dominio cohesivo.



\## Decisión

Se decide implementar una arquitectura monolítica usando Spring Boot, estructurada internamente en capas modulares (Controlador, Servicio, Repositorio).



\## Consecuencias

\* \*\*Positivas:\*\* Facilidad de prueba, despliegue directo y gestión de transacciones simple.

\* \*\*Negativas:\*\* Escalado independiente de componentes limitado si el sistema crece en el futuro.

