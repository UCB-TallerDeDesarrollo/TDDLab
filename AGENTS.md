# Instrucciones del proyecto TDDLab

## Contexto
- Proyecto de desarrollo de software del repositorio TDDLab.
- La interfaz utiliza React y Vite en las partes correspondientes del proyecto.
- Antes de modificar código, identifica la arquitectura, los componentes y los servicios existentes.

## Reglas de trabajo
- Analizar el código existente antes de proponer o realizar cambios.
- Mantener el estilo y las convenciones utilizadas por el equipo.
- Evitar modificaciones que no sean necesarias para resolver la tarea solicitada.
- No eliminar funcionalidades adicionales sin confirmar que están relacionadas con el requerimiento.
- Reutilizar componentes, hooks, servicios y utilidades existentes cuando corresponda.
- No modificar archivos de configuración, dependencias o backend si no es necesario.
- No inventar endpoints, estructuras de datos ni funciones que no existan.
- Explicar qué archivos se modifican y por qué.

## Corrección de bugs
- Primero reproducir o identificar la causa del problema.
- Revisar las referencias en la interfaz, el estado de React, los hooks, los servicios y el backend cuando corresponda.
- Corregir la causa del bug en lugar de ocultar solamente sus efectos visuales.
- Revisar posibles regresiones en las funcionalidades relacionadas.
- Ejecutar las pruebas disponibles y los comandos de validación definidos en el proyecto.

## Git
- Trabajar únicamente en la rama solicitada por el desarrollador.
- No cambiar de rama, hacer commits, hacer push ni ejecutar operaciones destructivas sin autorización.
- No descartar cambios del usuario.
- No modificar archivos que no estén relacionados con la tarea.

## Restricciones para Gráficas Adicionales
- Analizar las referencias a "Mostrar Gráficas Adicionales" en la vista del docente y las tareas.
- Revisar el toggle, las columnas de tablas, las condiciones de renderizado, los feature flags y la lógica asociada.
- Eliminar únicamente los elementos y la lógica que el requerimiento indique retirar.
- Verificar que las tablas, tareas y demás opciones de la vista del docente sigan funcionando correctamente.
- No eliminar gráficos ni funcionalidades distintas que todavía sean requeridas.
- Documentar los archivos modificados y las verificaciones realizadas.