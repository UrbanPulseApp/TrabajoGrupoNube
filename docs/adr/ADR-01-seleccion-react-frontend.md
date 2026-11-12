# ADR-01: Selección de React para la Interfaz de Usuario Front-end

- **Asunto (Issue):** 
  El sistema UrbanPulse requiere una interfaz de usuario interactiva y fluida que permita a la ciudadanía registrar incidencias urbanas con coordenadas, descripciones y multimedia (RF03, RF05), y a los operadores/técnicos realizar la validación, asignación, búsqueda y visualización sobre mapas en tiempo real (RF07, RF08, RF09). 
  Debemos abordar esta decisión ahora debido a la necesidad de construir un Mínimo Producto Viable (MVP) ejecutable e independiente en un plazo ajustado de semana y media, desacoplando el desarrollo de la interfaz frente a la API REST del backend en Spring Boot.

- **Decisión (Decision):** 
  Adoptar **React** (utilizando Vite/Node.js) como el framework de la capa de presentación (frontend), estructurado como una Single Page Application (SPA) desacoplada que se comunica de forma exclusiva con el backend mediante peticiones HTTP RESTful e intercambios JSON.

- **Estado (Status):** 
  Decidida.

- **Grupo (Group):** 
  Presentación (Interfaz de Usuario).

- **Supuestos (Assumptions):** 
  - El equipo cuenta con disponibilidad de entornos Node.js (v18+) e integrantes con capacidad para desarrollar componentes en JavaScript/JSX.
  - El backend proporcionará endpoints REST documentados para la ingesta y gestión de incidencias (`/api/incidents`).
  - El volumen de carga inicial del MVP permite la ejecución de la SPA cliente sin requerir arquitecturas complejas de renderizado del lado del servidor (SSR).

- **Restricciones (Constraints):** 
  - Exige configurar correctamente las políticas de *Cross-Origin Resource Sharing* (CORS) en el backend de Spring Boot para permitir peticiones desde el servidor de desarrollo/despliegue del cliente.
  - Exige empaquetar y gestionar las dependencias del cliente de manera independiente a través de `package.json`.
  - Obliga al cliente a gestionar localmente el estado de la sesión, tokens de autenticación (RF01) y el enrutamiento interno en el navegador.

- **Posiciones (Positions):** 
  1. **React (SPA desacoplada):** Desarrollo cliente con JavaScript en una arquitectura separada del backend Java/Spring Boot.
  2. **Renderizado del lado del servidor clásico (Spring Boot + Thymeleaf / HTML estático):** Arquitectura monolítica tradicional donde el servidor Java genera dinámicamente las vistas HTML.
  3. **Otros frameworks SPA (Vue.js / Angular):** Alternativas de frontend basadas en componentes de cliente desacoplados.

- **Argumento (Argument):** 
  Se selecciona **React** por las siguientes razones clave:
  - **Tiempo de salida al mercado e independencia de tareas:** Permite que la issue `#21` (desarrollo del formulario/front) sea trabajada en paralelo por los miembros del equipo de frontend sin colisionar ni generar bloqueos en Git con las tareas de modelo JPA del backend (`#19`, `#20`).
  - **Reactividad para mapas e interfaces dinámicas:** Su modelo basado en componentes reactivos se adecúa a los requisitos de mapas interactivos (RF08), actualización del ciclo de vida de incidencias en tiempo real (RF12) y gestión de evidencias dinámicas (RF05).
  - **Ecosistema y ligereza:** Ofrece un ecosistema amplio de librerías para mapas (Leaflet/Mapbox) y manejo de peticiones HTTP (Axios/Fetch API) integrables rápidamente en el MVP.

- **Implicaciones (Implications):** 
  - Requiere inicializar la estructura de carpetas `/frontend` con `package.json` e instalar dependencias base.
  - La sincronización entre el formulario de incidencias y la base de datos requerirá verificar la conectividad de los DTOs transmitidos vía API REST.
  - Aumenta la flexibilidad futura para sustituir o evolucionar el backend sin alterar la interfaz de usuario de la ciudadanía.

- **Decisiones relacionadas (Related decisions):** 
  - *ADR-02:* Uso de una arquitectura monolítica modular en el backend con Spring Boot y Java 11.
  - *ADR-03:* Uso de PostgreSQL sobre contenedores Docker para el entorno de persistencia.

- **Requisitos relacionados (Related requirements):** 
  - **RF01:** Identidad y acceso (autenticación de usuarios/personal).
  - **RF03:** Registrar incidencia (formulario reactivo de creación).
  - **RF05:** Evidencias (adjuntar fotografías/ficheros desde la interfaz).
  - **RF08:** Mapa (visualización de capas e incidencias).

- **Artefactos relacionados (Related artifacts):** 
  - Módulo `frontend/` (código fuente React y componentes).
  - Issue `#21`: *[Feat] Inicializar el frontend/package.json y conectar formulario React*.
  - Diagrama de contenedores C4 (desacoplamiento Single Page Application - REST API).

- **Principios relacionados (Related principles):** 
  - **Pauta de diseño:** "Se adopta la solución más sencilla que satisfaga los atributos de calidad medidos".
  - **Separación de responsabilidades (*Separation of Concerns*):** Desacoplar strictly la lógica de representación (UX/UI) de la lógica de negocio y persistencia.

- **Notas (Notes):** 
  Durante las sesiones de sincronización del equipo de trabajo, se confirmó que el desarrollo del formulario en React avanzará usando datos mockeados o endpoints locales (`http://localhost:8080/api/incidents`) hasta que la persistencia en PostgreSQL mediante Docker quede integrada completamente por el equipo de backend.