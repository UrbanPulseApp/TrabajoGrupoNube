# UrbanPulse frontend

Frontend de UrbanPulse: mapa de incidencias, ficha de cada aviso, asistente de reporte, histórico municipal, analítica y acceso, con modo claro y oscuro.

**Requiere Node >= 18** (definido en `engines` de `package.json`). La versión fijada para el desarrollo local en `.nvmrc` es Node 18.

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

## Pantallas

| Ruta | Pantalla |
|---|---|
| `/` | **Explorar**: mapa de incidencias con lista sincronizada, búsqueda y filtros. Pulsar un marcador abre una ficha flotante que lleva a la incidencia. `/?i=<id>` enlaza a una incidencia seleccionada. |
| `/incidencias/:id` | **Ficha de la incidencia**: progreso por estados, descripción, evidencias (visor de fotos), historial, contexto urbano, mapa, avisos cercanos y, para el personal municipal, la gestión (estado y asignaciones). |
| `/reportar` | **Asistente de reporte** en tres pasos: ubicación, detalles y revisión. Avisa de posibles duplicados cercanos. |
| `/historico` | **Histórico municipal** (Open Data Málaga, GECOR): mapa agrupado, ranking de tipos y expediente de cada punto. |
| `/analitica` | **Analítica** por estado, categoría y distrito (operadores, analistas y administradores). |
| `/login` | Acceso, registro ciudadano y datos de la cuenta. |

La aplicación usa rutas del navegador (`react-router-dom`). En producción el servidor debe devolver `index.html` para cualquier ruta que no sea un archivo ni `/api` (*SPA fallback*).

## Estructura

- `src/App.jsx`: rutas. Explorar se carga siempre; el resto de pantallas, bajo demanda.
- `src/pages/`: una pantalla por archivo, con su `.css`.
- `src/components/layout/`: marco de la app (barra superior, navegación móvil, menú de usuario, selector de tema).
- `src/components/map/`: mapa base, marcadores por estado y categoría, agrupación, capa del histórico y selector de ubicación.
- `src/components/incidents/`: tarjeta, ficha flotante, progreso, historial, galería, contexto urbano y gestión municipal.
- `src/components/ui/`: piezas pequeñas reutilizables (estado, categoría, estados vacíos, iconos).
- `src/context/`: sesión (`AuthContext`), tema claro/oscuro (`ThemeContext`) y avisos (`ToastContext`).
- `src/lib/incidentMeta.js`: estados, categorías, etiquetas y formato de fechas, en un único sitio.
- `src/services/`: comunicación con la API (sin cambios de contrato).
- `src/styles/theme.css`: tokens de diseño. El modo oscuro solo redefine variables en `html[data-theme="dark"]`.
- `src/styles/ui.css`: botones, campos, chips, estados y utilidades compartidas.

## Diseño

- **Tema**: sigue el del sistema y se puede cambiar desde la barra superior; la elección se guarda en `localStorage` (`urbanpulse-theme`).
- **Color de estado**: cada estado tiene color, icono y texto (variables `--st-*`), nunca solo color.
- **Tipografías**: Bricolage Grotesque (títulos) y Public Sans (texto), autoalojadas con `@fontsource`; no se hacen peticiones a terceros.
- **Iconos**: `lucide-react`.
- **Mapa**: teselas de OpenStreetMap; en modo oscuro se invierten por CSS.

El formulario admite hasta 4 evidencias por incidencia (JPG, PNG, WEBP o PDF, 10 MB máximo por archivo). Los adjuntos deben almacenarse en un directorio persistente configurado con `ATTACHMENTS_DIRECTORY` al desplegar el backend.
