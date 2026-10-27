# Integración: eliminar gráficas adicionales

Rama: `eliminarGraficasAdicionalesIntegracion`. Base: `main` en
`9d7353db1fa57ba65952095d1b8c4c6cc235afa0`.

## Aportes integrados

| Origen | Referencia revisada | Aporte |
| --- | --- | --- |
| Rama del solicitante | `4.0.4/limpiar_graficas_adicionales` (`449f1723`) | Eliminación de `/aditionalgraph`, simplificación de contratos `graphs`/`typegraphs`, navegación docente a `/graph` y pruebas de regresión. |
| José Carlos | PR #781, `LosTemporales-03-fix-CorregirGraficasAdicionales` (`524178bc`) | Ocultar la bandera obsoleta `Mostrar Graficas Adicionales` en el listado del frontend. |
| Jhean Marco | `UCM-BL-01-Eliminar-Graficas-Adicionales` (`0169eed3`) | Opciones de métricas fuera del componente y validación de la preferencia guardada. |

Se integran los cambios funcionales seleccionados, sin incorporar documentación de agentes, herramientas auxiliares ni cambios de formato del backend.

## Comportamiento resultante

- Se retiran del selector `Complejidad` y `Pie`, y se elimina la ruta de gráficas adicionales.
- La navegación docente y entre entregas utiliza la visualización principal.
- Si una preferencia guardada es antigua, desconocida o no está disponible, se elige `Dashboard` cuando existen logs y `Total Número de Tests` cuando no existen.
- La selección y el estado del padre se sincronizan al iniciar, recibir eventos de almacenamiento o cambiar la disponibilidad de logs. La recuperación automática conserva la preferencia guardada; una selección explícita del usuario la actualiza.
- El filtro de banderas afecta únicamente al listado del frontend. No elimina registros de la base de datos ni modifica las demás banderas.

## Validación

Desde `Web Ui`:

```sh
npx jest --runInBand --coverage=false test/presentation/tdd-visualization test/presentation/assignments/assignmentDetail.test.tsx test/presentation/my-practices/practiceDetailPage.test.tsx test/modules/FeatureToggles
npm run build
```

Resultado: **14 suites y 69 pruebas aprobadas**. Compilación TypeScript y build de Vite correctos; Vite advierte sobre paquetes de más de 500 kB. Las pruebas cubren rutas retiradas, navegación, opciones disponibles, recuperación de preferencias, cambios de logs y filtrado de banderas. No se ejecutó la suite completa ni Cypress.
