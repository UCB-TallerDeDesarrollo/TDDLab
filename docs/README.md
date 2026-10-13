# Mapa mínimo del proyecto

## Estructura existente

| Ruta | Responsabilidad |
| --- | --- |
| `Web Ui/src` | Frontend React y TypeScript; `presentation` contiene páginas, componentes y hooks, y `modules` agrupa responsabilidades de dominio, aplicación y repositorios. |
| `Web Ui/test` | Pruebas Jest del frontend. Aquí permanecen las pruebas de la limpieza de gráficas. |
| `server/src` | Backend Express y TypeScript, con módulos y capas de la arquitectura existente. |
| `server/test` | Pruebas del backend. |
| `VSCodeExtension` | Extensión de VS Code; proyecto separado. |
| `cypress` y `Web Ui/test/cypress` | Recursos de pruebas de navegador existentes. |
| `.github/workflows` | Automatización de CI y despliegue existente. |

Los subproyectos tienen sus propios `package.json` y lockfiles. Ejecutar los comandos en el subproyecto correspondiente; no reorganizarlo como monorepo ni crear otro directorio raíz de pruebas.

## Contexto, estado y evidencia

- [AGENTS.md](../AGENTS.md): entrada para trabajar en el repositorio.
- [CHECKPOINTS.md](../CHECKPOINTS.md): condiciones de cierre local.
- [feature_list.json](../feature_list.json): estado estructurado de las tareas de esta entrega; no pretende inventariar todo el backlog del equipo.
- [progress/current.md](../progress/current.md): punto de continuidad, resultados y pendientes.
- [Informe de gráficas adicionales](../LIMPIEZA_GRAFICAS_ADICIONALES.md): análisis, ciclo TDD, commits y límites de la verificación.

## Entorno y comandos

Requisitos: Git, Node.js, npm y dependencias instaladas en el subproyecto. En la validación de esta tarea se usaron Node 22.12.0 y npm 11.1.0; son versiones observadas, no una nueva restricción del proyecto.

Desde la raíz, en Git Bash o Bash:

```bash
bash init.sh
```

El script comprueba herramientas, ubicación y disponibilidad de Jest y TypeScript del frontend. No instala, no modifica archivos y no certifica que las pruebas pasen. Si faltan dependencias, ejecutar `npm ci` dentro de `Web Ui`.

Desde PowerShell en `Web Ui`, las seis pruebas nuevas:

```powershell
npx.cmd jest --runInBand --runTestsByPath test/presentation/tdd-visualization/TDDGraphRoutes.test.tsx test/presentation/tdd-visualization/TDDChartMetrics.test.tsx test/presentation/tdd-visualization/useTDDChartPage.navigation.test.tsx
```

Regresión de las áreas afectadas, tipos y lint:

```powershell
npx.cmd jest --runInBand test/presentation/tdd-visualization test/presentation/assignments/assignmentDetail.test.tsx test/presentation/my-practices/practiceDetailPage.test.tsx
npx.cmd tsc --noEmit -p .
npm.cmd run lint
```

Usar `npx.cmd jest --runInBand` para la suite completa del frontend. En Bash, usar `npx` y `npm` sin `.cmd`. Consultar el manifiesto de cada subproyecto antes de ejecutar otras verificaciones.

Esta estructura implementa contexto, estado y verificación persistentes del Pilar 1. No implementa por sí sola autorización, aislamiento, orquestación multiagente ni un sistema de evaluación de agentes.
