#  Guía de Desarrollo - UrbanPulse

Este documento describe los requisitos y pasos necesarios para preparar el entorno de desarrollo local y contribuir al proyecto.

---

##  Requisitos Previos

* **Java**: OpenJDK 11
* **Build Tool**: Apache Maven 3.8+
* **Node.js**: v18+ y `npm`
* **Contenedores**: Docker y Docker Compose
* **Control de Versiones**: Git

---

##  Preparación del Entorno Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/urbanpulseapp/trabajogruponube.git
   cd trabajogruponube
   ```

2. **Configurar variables de entorno**:
   Copia el archivo de ejemplo para crear tu entorno local:
   ```bash
   cp .env.example .env
   ```

3. **Iniciar la base de datos (PostgreSQL)**:
   ```bash
   docker compose up -d
   ```

4. **Ejecutar el Backend (Spring Boot)**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   *El servidor estará disponible en `http://localhost:8080`.*

   Para crear el primer administrador, configura `URBANPULSE_ADMIN_EMAIL` y `URBANPULSE_ADMIN_PASSWORD` en las variables de entorno de la configuración de ejecución de IntelliJ antes de iniciar Spring. La contraseña debe tener al menos 12 caracteres. Si ambas variables están vacías, no se crea una cuenta administrativa. Las cuentas ciudadanas se registran desde `/login`; el administrador crea cuentas de operador, técnico y analista mediante `POST /api/admin/users`.

5. **Ejecutar el Frontend (React)**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   La página de acceso está en `http://localhost:5173/login`. El inicio de sesión se conserva en una cookie de sesión HttpOnly; las peticiones de escritura incluyen protección CSRF.

---

##  Pruebas y Validación

Antes de abrir una Pull Request, es obligatorio verificar que la suite de pruebas se ejecute correctamente:

```bash
# Ejecutar tests unitarios e integración en Backend
cd backend
mvn clean verify
```

---

##  Flujo de Trabajo en Git

Sigue la convención descrita en **[CONTRIBUTING.md](../CONTRIBUTING.md)** para la creación de ramas (`feature/`, `fix/`), uso de *Conventional Commits* y gestión de *Pull Requests*.
