#  Guía de Despliegue - UrbanPulse

Este documento detalla el procedimiento para empaquetar y desplegar la aplicación UrbanPulse mediante contenedores Docker.

---

##  1. Empaquetado de la Aplicación

Antes del despliegue en un entorno de producción o pruebas, se debe realizar el empaquetado de los módulos:

### Backend (Spring Boot)
Generar el archivo ejecutable `.jar`:
```bash
cd backend
mvn clean package -DskipTests
```

### Frontend (React)
Generar los archivos estáticos de producción:
```bash
cd frontend
npm install
npm run build
```

---

##  2. Despliegue con Docker Compose

El proyecto cuenta con un archivo `docker-compose.yml` en la raíz que orquesta los servicios necesarios.

1. **Configurar las variables de entorno**:
   Crea el archivo `.env` en la raíz copiando la plantilla de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. **Levantar los contenedores**:
   ```bash
   docker compose up -d --build
   ```

3. **Comprobar el estado de los servicios**:
   ```bash
   docker compose ps
   ```

---

##  3. Monitoreo y Verificación de Salud

Para comprobar el correcto funcionamiento del sistema tras el despliegue:

* **Consultar los logs del sistema**:
  ```bash
  docker compose logs -f
  ```

* **Comprobar el estado de PostgreSQL**:
  ```bash
  docker exec -it urbanpulse-db pg_isready
  ```

---

##  4. Detención del Servicio

Para detener los contenedores y liberar los recursos:
```bash
docker compose down
```