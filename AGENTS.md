# Guía de trabajo en TDDLab

## Leer al comenzar

1. Consultar `git status --short` y la rama actual. Conservar cambios ajenos.
2. Leer [docs/README.md](docs/README.md) para ubicar código y comandos.
3. Leer [progress/current.md](progress/current.md) y [feature_list.json](feature_list.json) para retomar la tarea.
4. Aplicar [CHECKPOINTS.md](CHECKPOINTS.md) antes de marcar una tarea como terminada.

## Reglas de trabajo

- Resolver solo el alcance solicitado con el cambio más simple; mantener la estructura existente y la separación de capas.
- Ejecutar `bash init.sh` desde Git Bash o Bash para comprobar el entorno del frontend. El script no instala dependencias ni ejecuta pruebas.
- Para cambios de comportamiento, escribir una prueba que falle por el motivo correcto antes de implementar. Para código muerto, comprobar referencias y conservar pruebas de regresión; no inventar una fase roja.
- Ejecutar las pruebas pertinentes, comprobar tipos y comparar lint con la línea base. Registrar resultados reales y verificaciones pendientes.
- Hacer commits pequeños por propósito. No incluir secretos, `.env`, `node_modules`, logs voluminosos ni cambios ajenos.
- Actualizar el estado en `feature_list.json` y `progress/current.md` al finalizar o quedar pendiente, enlazando evidencia del repositorio.
- No afirmar aprobación de revisión independiente, CI, publicación o despliegue sin evidencia. Push y merge son acciones separadas del cierre local.

No se necesita un framework ni varios agentes para seguir esta guía. Estos archivos orientan el trabajo; los permisos y el aislamiento los controla el entorno que ejecuta las herramientas.
