# Guía de Desarrollo - UrbanPulse

Este documento describe los requisitos y pasos necesarios para preparar el entorno de desarrollo local y contribuir al proyecto.

---

## 1. Requisitos previos

Para trabajar con el proyecto es necesario disponer de:

* **Java**: OpenJDK **11** (versión fijada en `backend/pom.xml` y en la CI).
* **Build Tool**: Apache Maven **3.8+**.
* **Node.js**: **v18+** (ver `engines` en `frontend/package.json`) y `npm`.
* **Contenedores**: Docker y Docker Compose.
* **Control de versiones**: Git.

PostgreSQL **no** hace falta instalarlo en el equipo: se ejecuta mediante Docker Compose.

---

## 2. Preparación del entorno local

### 2.1. Clonar el repositorio

```bash
git clone https://github.com/UrbanPulseApp/TrabajoGrupoNube.git
cd TrabajoGrupoNube
```

### 2.2. Configurar variables de entorno

Copia el fichero de ejemplo para crear tu configuración local:

```bash
cp .env.example .env
```

Revisa las variables de `.env` y ajusta sus valores si fuera necesario. El fichero `.env` **no debe versionarse** (está en `.gitignore`); solo se versiona `.env.example` con valores de ejemplo.

### 2.3. Levantar la base de datos (PostgreSQL)

El proyecto usa `docker-compose.yml` para PostgreSQL 16:

```bash
docker compose up -d
```

Comprobar el estado de los contenedores:

```bash
docker compose ps
```

Detener el entorno cuando termines:

```bash
docker compose down
```

### 2.4. Ejecutar el backend (Spring Boot)

Con la base de datos levantada:

```bash
cd backend
mvn spring-boot:run
```

El servidor quedará disponible en `http://localhost:8080`.

**Administrador inicial:** para crear el primer administrador, configura `URBANPULSE_ADMIN_EMAIL` y `URBANPULSE_ADMIN_PASSWORD` en las variables de entorno de la configuración de ejecución (p. ej. IntelliJ) antes de iniciar Spring. La contraseña debe tener **al menos 12 caracteres**. Si ambas variables están vacías, no se crea una cuenta administrativa; **no hay credenciales por defecto**.

* Las cuentas ciudadanas se registran desde `/login`.
* El administrador crea cuentas de operador, técnico y analista mediante `POST /api/admin/users`.

### 2.5. Ejecutar el frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

La página de acceso está en `http://localhost:5173/login`. El inicio de sesión se conserva en una **cookie de sesión `HttpOnly`**; las peticiones de escritura incluyen **protección CSRF**. Vite reenvía `/api` a `http://localhost:8080`.

El mapa histórico lee el CSV de GECOR incluido en `backend/src/main/resources/data/gecor/`, por lo que no necesita conexión a Internet ni configuración adicional.

Otros comandos disponibles en el frontend (definidos como scripts en `package.json`):

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Compila la build de producción |
| `npm run preview` | Sirve localmente la build de producción |

---

## 3. Pruebas y validación

Antes de abrir un Pull Request es obligatorio verificar que la suite pasa:

```bash
cd backend
mvn clean verify
```

`mvn verify` compila el proyecto, ejecuta las pruebas y realiza las comprobaciones de validación configuradas en el `pom.xml`.

> La **integración continua** (`.github/workflows/ci.yml`) ejecuta exactamente `mvn -B verify --file backend/pom.xml` en cada Pull Request hacia `main`, levantando un PostgreSQL 16 como servicio y usando **JDK 11**. Si en local pasa `mvn verify` con JDK 11, debería pasar en CI.

---

## 4. Flujo de trabajo con Git

El flujo (ramas efímeras desde `main`, Conventional Commits y Pull Request con revisión) está descrito en **[CONTRIBUTING.md](../CONTRIBUTING.md)**.

---

## 5. Variables de entorno y secretos

* Las credenciales y valores dependientes del entorno **no** se incluyen en el código fuente.
* Se documentan las variables necesarias en `.env.example`; el `.env` real **nunca** se sube al repositorio.
* En el backend, la configuración de cada entorno se inyecta por variables de entorno (12-Factor, factor *Config*).
* El administrador inicial se define con `URBANPULSE_ADMIN_EMAIL` y `URBANPULSE_ADMIN_PASSWORD` (contraseña ≥ 12 caracteres); no se versionan y no hay cuentas predeterminadas.

---

## 6. Buenas prácticas

* Mantener `main` en estado estable.
* Una rama por funcionalidad/corrección/cambio relevante.
* Commits pequeños y descriptivos (Conventional Commits).
* Ejecutar `mvn clean verify` antes de subir cambios.
* Integrar siempre mediante Pull Request.
* No almacenar contraseñas, tokens ni credenciales en Git.
* Mantener actualizada la documentación cuando cambie el comportamiento o la configuración.
