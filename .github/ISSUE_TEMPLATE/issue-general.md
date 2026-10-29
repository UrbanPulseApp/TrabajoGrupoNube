---
name: Plantilla de Issue General
about: Plantilla estándar para la creación de tareas y funcionalidades
title: ''
labels: ''
assignees: ''
---

## Descripción
Como [Rol / Developer], debo [propósito claro de la issue], para que [beneficio o funcionalidad esperada en el sistema] (RFXX).

## Tareas de Desarrollo
- [ ] Crear / Modificar [Clase / Interfaz / Archivo] en el paquete `com.urbanpulse.[subpaquete]`.
- [ ] Implementar la lógica o atributos necesarios: [listar atributos o métodos clave].
- [ ] Añadir / Configurar anotaciones relacionales o de configuración (`@Entity`, `@Table`, `@Column`, etc.).
- [ ] Probar la funcionalidad de forma local mediante tests unitarios, de integración o llamadas a la API REST (`docker compose up -d`).

## Requisitos y Criterios del Proyecto
- **RFXX:** [Nombre y descripción breve del requisito funcional relacionado].

## Definition of Done (DoD)
- [ ] El código compila correctamente sin errores ni advertencias graves en el entorno de desarrollo.
- [ ] Los cambios respetan las convenciones del repositorio (`com.urbanpulse.entity`, getters/setters explícitos, etc.).
- [ ] La tabla / endpoint se mapea e integra sin errores contra PostgreSQL / Docker.
- [ ] Pull Request (PR) creada en GitHub, vinculada a esta issue y aprobada tras Code Review por un Reviewer.
