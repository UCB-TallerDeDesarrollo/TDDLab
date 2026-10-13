# Criterios de cierre local

Una tarea puede marcarse `done` cuando se cumplan los criterios aplicables y sus límites estén escritos. `done` significa alcance local verificado; no significa PR aprobado, CI verde o despliegue realizado.

- [ ] Alcance y base identificados; cambios previos preservados.
- [ ] Referencias y consumidores inspeccionados antes de eliminar código.
- [ ] Pruebas de comportamiento o regresión ejecutadas; Red/Green documentado cuando corresponda.
- [ ] TypeScript comprobado si cambia código TypeScript; lint comparado con la línea base.
- [ ] Sin regresiones conocidas introducidas. Los fallos nuevos se corrigen antes del cierre; los preexistentes y las comprobaciones incompletas se registran.
- [ ] Diff revisado: sin cambios ajenos, secretos ni dependencias innecesarias; commits por propósito.
- [ ] `feature_list.json` y `progress/current.md` actualizados con evidencia y pendientes.

Para cambios solo de documentación o herramientas de apoyo, validar enlaces, JSON, sintaxis y ejecución del script según corresponda. No repetir toda la suite de la aplicación sin una razón relacionada con el cambio.

Si una comprobación necesaria no pudo completarse, usar `pending` o `in_progress` y explicar qué falta. Una suite completa no ejecutada no se describe como aprobada: precisar las suites que sí se verificaron y el alcance que sustentan.
