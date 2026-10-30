# UrbanPulse frontend

Frontend de UrbanPulse con acceso en `/login`, registro ciudadano, reporte de incidencias, evidencias y seguimiento público.

**Requiere Node >= 18.** La versión recomendada para este proyecto es Node 20 (indicada en `.nvmrc`).

## Desarrollo local

1. Inicia el backend Spring Boot en `http://localhost:8080`.
2. Desde esta carpeta instala las dependencias y arranca Vite:

   ```bash
   npm install
   npm run dev
   ```

3. Abre la URL que indique Vite (por defecto `http://localhost:5173`). Las peticiones `/api` se reenvían al backend en el puerto `8080`.

El botón de inicio de sesión de la página principal abre `http://localhost:5173/login`. La sesión permanece en una cookie HttpOnly. Las cuentas ciudadanas se registran desde esa pantalla; las cuentas operativas las crea un administrador.

Para usar otra URL de API, crea un archivo `.env.local` en esta carpeta con `VITE_API_URL=https://tu-api.example/api/incidents`.

## Estructura

- `src/App.jsx`: composición de la página y navegación.
- `src/components/IncidentForm.jsx`: formulario, selección de evidencias y envío de reportes.
- `src/components/IncidentBoard.jsx`: listado público paginado, búsqueda, filtros, historial y descarga de evidencias.
- `src/components/IncidentMap.jsx`: selección de coordenadas en el mapa de Málaga.
- `src/services/IncidentService.js`: comunicación con la API de incidencias y adjuntos.
- `src/services/AuthService.js`: inicio/cierre de sesión, consulta de la sesión actual y registro ciudadano.
- `src/services/ApiClient.js`: credenciales de sesión y token CSRF para peticiones de escritura.
- `src/pages/LoginPage.jsx`: página separada de acceso y creación de cuenta ciudadana.
- `src/styles.css`: estilos y adaptación a pantallas pequeñas.

El formulario admite hasta 4 evidencias por incidencia (JPG, PNG, WEBP o PDF, 10 MB máximo por archivo). Los adjuntos deben almacenarse en un directorio persistente configurado con `ATTACHMENTS_DIRECTORY` al desplegar el backend.
