# UrbanPulse frontend

Interfaz ciudadana de UrbanPulse construida con React, Vite y React Leaflet.

## Desarrollo local

1. Inicia el backend Spring Boot en `http://localhost:8080`.
2. Desde esta carpeta instala las dependencias y arranca Vite:

   ```bash
   npm install
   npm run dev
   ```

3. Abre la URL que indique Vite (por defecto `http://localhost:5173`). Las peticiones `/api` se reenvían al backend en el puerto `8080`.

Para usar otra URL de API, crea un archivo `.env.local` en esta carpeta con `VITE_API_URL=https://tu-api.example/api/incidents`.

## Estructura

- `src/App.jsx`: composición de la página y navegación.
- `src/components/IncidentForm.jsx`: formulario y envío de reportes.
- `src/components/IncidentMap.jsx`: selección de coordenadas en el mapa de Málaga.
- `src/services/IncidentService.js`: comunicación con `POST /api/incidents` y `GET /api/incidents/{id}`.
- `src/styles.css`: estilos y adaptación a pantallas pequeñas.
