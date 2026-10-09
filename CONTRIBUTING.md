# Guía de Contribución para UrbanPulse

## Flujo de Trabajo en Git (GitHub Flow)

1. La rama `main` debe mantenerse siempre estable y compilable.
2. Cada tarea se desarrollará en una rama efímera creada desde `main`:
   * `feature/nombre-funcionalidad`
   * `fix/descripcion-error`
   * `docs/nombre-documento`
   * `chore/mantenimiento-configuracion`
3. Usar **Conventional Commits** para los mensajes de commit:
   * `feat:` para nuevas funcionalidades
   * `fix:` para solución de errores
   * `docs:` para cambios en la documentación
   * `refactor:` para mejoras de código sin cambio funcional
   * `test:` para añadir o modificar pruebas
   * `chore:` para dependencias o tareas de build
4. Abrir un **Pull Request** hacia `main` y solicitar la revisión de al menos un compañero antes de fusionar.
