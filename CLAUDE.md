# CLAUDE.md — Instrucciones de Trabajo para Claude Code (UrbanPulse)

## 1. Fuente de Verdad Obligatoria

Antes de realizar cualquier análisis, plan o modificación de código, lee y cumple estrictamente todas las reglas definidas en `ia-contexto.md` (ubicado en la raíz del repositorio). Ese documento contiene la arquitectura monolítica modular, el modelo de dominio, los contratos REST, la seguridad RBAC y las pautas de gobernanza del proyecto **UrbanPulse**.

---

## 2. Control de Contexto y Ahorro de Tokens (Crítico)

Para evitar consumir innecesariamente la ventana de contexto y tokens por sesión, **NUNCA** leas, busques dentro ni cargues los siguientes archivos o directorios masivos/generados salvo orden explícita del usuario:

* `backend/src/main/resources/data/gecor/gecor-2026.csv` (dataset histórico masivo)
* `frontend/package-lock.json`
* `backend/target/`
* `frontend/node_modules/` y `frontend/dist/`
* `backend/uploads/`

---

## 3. Invariantes Técnicas del Código

* **Stack:** Java 11, Spring Boot 2.6, Spring Data JPA, Spring Security, PostgreSQL 16 (backend) y React + Vite + React Leaflet (frontend).
* **Identificadores UUID:** Todas las entidades principales y DTOs emplean claves opacas `UUID` (prevención de IDOR).
* **DTOs y Errores:** Prohibido exponer entidades JPA directamente en controladores. Usa siempre DTOs explícitos (`*Request` / `*Response`) y gestiona las excepciones mediante `GlobalExceptionHandler` devolviendo `ApiError` con cabecera `X-Request-ID`.
* **Estilo Java:** No introduzcas Lombok. Mantén constructores, *getters* y *setters* explícitos bajo la jerarquía de paquetes `com.urbanpulse.*`.
* **Degradación Controlada:** Toda integración externa (`com.urbanpulse.external.*`) debe aislar fallos con `try-catch` y devolver valores de reserva (*fallback*) sin bloquear el flujo principal de incidencias.
* **Sincronización Full-Stack:** Si modificas un endpoint, DTO o regla de seguridad en Spring Boot, actualiza en la misma tarea `frontend/src/services/`, los componentes React afectados y `docs/api/acuerdo-api.md`.

---

## 4. Comandos de Compilación y Verificación

Antes de dar por finalizada cualquier tarea de código, verifica que compila y pasa las pruebas:

* **Base de datos local (PostgreSQL):**

        docker compose up -d

* **Tests del Backend (Spring Boot / Maven):**

        mvn -B test --file backend/pom.xml

* **Build del Frontend (React / Vite):**

        npm run build --prefix frontend

---

## 5. Flujo Git y Documentación (GitHub Flow)

* **Ramas:** Nunca hagas commits ni push directamente sobre `main`. Verifica antes en qué rama estás (`git branch --show-current`) y trabaja siempre en ramas efímeras (`feature/...`, `fix/...`, `docs/...`, `refactor/...`, `chore/...`).
* **Commits:** Redacta los mensajes siguiendo **Conventional Commits** (`feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`, `test: ...`, `chore: ...`).
* **Documentación viva:** Si introduces una decisión arquitectónica nueva o relevante, documéntala en `docs/adr/` siguiendo la numeración secuencial existente y mantén actualizado `docs/api/acuerdo-api.md`.

---

## 6. Idioma

* Responde siempre al usuario en **español**.
* Escribe todo el código fuente (clases, métodos, variables, DTOs, tests y comentarios técnicos) en **inglés**.
