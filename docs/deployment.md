# Guía de empaquetado y ejecución - UrbanPulse

La configuración Docker actual levanta PostgreSQL. El backend y el frontend se ejecutan o empaquetan por separado; el `docker-compose.yml` aún no contiene servicios de aplicación.

## Desarrollo local

1. En la raíz, arranca PostgreSQL:

   ```bash
   docker compose up -d postgres
   ```

2. En otra terminal, inicia Spring Boot:

   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. En una tercera terminal, inicia Vite:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

El frontend está disponible en `http://localhost:5173`; Vite reenvía `/api` a `http://localhost:8080`.

## Empaquetado

```bash
cd backend
mvn clean package -DskipTests

cd ../frontend
npm install
npm run build
```

El backend produce el JAR en `backend/target/` y Vite genera los recursos en `frontend/dist/`.

## PostgreSQL y evidencias

La configuración de base de datos usa `DATABASE_URL`, `POSTGRES_USER` y `POSTGRES_PASSWORD`; consulta `.env.example`. Las evidencias se escriben en `uploads/attachments` relativo al directorio desde el que se inicia el backend. En un servidor configura `ATTACHMENTS_DIRECTORY` con una ruta persistente y monta allí un volumen con permisos de escritura. PostgreSQL y los ficheros deben respaldarse por separado.

El Compose actual no despliega el JAR ni los recursos de Vite. La API tampoco aplica todavía autenticación/autorización; no expongas las operaciones de cambio de estado o asignación a Internet hasta incorporar RBAC.
