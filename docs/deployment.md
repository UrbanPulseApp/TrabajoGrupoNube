# Guía de empaquetado y ejecución - UrbanPulse

La configuración Docker actual levanta PostgreSQL. El backend y el frontend se ejecutan o empaquetan por separado; `docker-compose.yml` todavía no contiene servicios de aplicación.

La preparación del entorno local está documentada en [development.md](development.md).

## Empaquetado

```bash
cd backend
mvn clean package -DskipTests

cd ../frontend
npm install
npm run build
```

Spring Boot produce el JAR en `backend/target/` y Vite genera los recursos en `frontend/dist/`.

## Despliegue y seguridad

La API usa sesiones HttpOnly y protección CSRF. En producción debe servirse detrás de HTTPS para proteger las credenciales y cookies durante el transporte. Configura un administrador inicial mediante secretos de entorno; no guardes esas credenciales en Git ni dejes cuentas predeterminadas.

Las evidencias se guardan en `uploads/attachments` relativo al directorio desde el que se inicia el backend. Configura `ATTACHMENTS_DIRECTORY` con una ruta persistente, móntala con permisos de escritura y respalda sus archivos junto con PostgreSQL. La base de datos y el almacén de adjuntos se respaldan por separado.

Las operaciones de cambio de estado y asignación están protegidas por rol.
