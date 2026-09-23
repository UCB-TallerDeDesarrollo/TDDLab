# Mejora de acciones y estado visual de tareas

**Rama base:** `prime_tddlab_1_error_states`

**Rama de trabajo:** `prime-feat/mejora-acciones-estado-tarea`

## 1. Objetivo

Mejorar la experiencia del estudiante en el detalle de una tarea mediante dos
cambios acotados:

1. Mostrar únicamente la acción válida del ciclo de entrega.
2. Presentar el estado de la entrega como un chip con significado visual.

La implementación se realiza de forma incremental para que cada commit sea
pequeño, verificable y reversible.

## 2. Problema actual

Cuando una tarea ya fue iniciada, el botón **Iniciar tarea** continúa visible
con apariencia inactiva junto a **Finalizar tarea**. Esto ocupa espacio y obliga
al estudiante a interpretar cuál acción corresponde.

Además, el estado se presenta como texto plano, por ejemplo
`Estado: En progreso`, sin suficiente jerarquía visual para identificar que la
entrega está activa.

## 3. Alcance

El cambio incluye únicamente el detalle de tareas para estudiantes:

- Lógica de visibilidad de **Iniciar tarea** y **Finalizar tarea**.
- Cálculo explícito de cuándo una entrega puede finalizarse.
- Chips visuales para `Pendiente`, `En progreso` y `Enviado`.
- Pruebas unitarias de los tres escenarios.
- Guion y evidencias para la demostración.

Quedan fuera del alcance:

- Backend, base de datos y contratos HTTP.
- Pantallas de prácticas.
- Tabla de entregas del docente.
- Reglas actuales de **Ver gráfica** y **Asistente IA**.
- Estilos globales de `StatefulButton`.

## 4. Comportamiento objetivo

| Estado de la entrega | Indicador | Iniciar tarea | Finalizar tarea |
|---|---|---|---|
| Sin entrega registrada | Chip gris `Pendiente` | Visible y activo | Oculto |
| Entrega `in progress` | Chip ámbar `En progreso` | Oculto | Visible y activo |
| Entrega `delivered` | Chip verde `Enviado` | Oculto | Oculto |

La interfaz conservará el texto del estado para que la información no dependa
únicamente del color.

## 5. Decisiones de diseño

### Acciones contextuales

- No se mostrarán acciones inválidas como botones deshabilitados.
- La existencia de una entrega evita volver a crearla.
- Solo una entrega con estado `in progress` puede mostrar
  **Finalizar tarea**.
- Después de finalizar, las acciones de inicio y fin desaparecen, pero las
  funciones de consulta permanecen disponibles según sus reglas actuales.

### Chips de estado

- `Pendiente`: tratamiento neutro gris.
- `En progreso`: tratamiento ámbar con mayor énfasis visual.
- `Enviado`: tratamiento verde de finalización correcta.
- Los estilos se limitarán a `.assignment-student-status` para no modificar los
  estados que se muestran en la tabla del docente.

## 6. Desarrollo incremental

1. Documentar alcance, decisiones y criterios de aceptación.
2. Aislar las dependencias asíncronas de las pruebas del detalle de tarea.
3. Reemplazar el booleano invertido por `canFinishTask` sin modificar la UI.
4. Aplicar la visibilidad contextual y cubrir los tres estados con pruebas.
5. Incorporar los chips semánticos y sus pruebas visuales.
6. Ejecutar las verificaciones finales y completar este documento con las
   evidencias de la demo.

## 7. Criterios de aceptación

- Una tarea sin entrega muestra **Iniciar tarea** y no muestra
  **Finalizar tarea**.
- Una tarea en progreso no muestra **Iniciar tarea** y sí muestra
  **Finalizar tarea**.
- Una tarea enviada no muestra ninguna de esas dos acciones.
- Cada estado utiliza el chip semántico correspondiente.
- Iniciar o finalizar refresca el detalle y actualiza estado y acciones sin una
  recarga manual de la página.
- **Ver gráfica**, **Asistente IA**, la vista docente y las prácticas no cambian.
- La tarjeta conserva una distribución usable en escritorio y móvil.

## 8. Verificación automatizada prevista

Prueba dirigida después de cada incremento funcional:

```powershell
cd "Web Ui"
.\node_modules\.bin\jest.cmd `
  "test/presentation/assignments/assignmentDetail.test.tsx" `
  --runInBand --coverage=false --forceExit
```

Verificación final:

```powershell
npm.cmd run lint
npm.cmd run build
.\node_modules\.bin\jest.cmd --runInBand --coverage=false --forceExit
```

## 9. Guion inicial de demo

1. Mostrar la captura anterior y señalar el botón de inicio inactivo y el
   estado plano.
2. Abrir una tarea pendiente y confirmar el chip gris y la acción de inicio.
3. Iniciar la tarea y confirmar el chip ámbar y la acción de finalización.
4. Finalizar la tarea y confirmar el chip verde y la ausencia de ambas
   acciones del ciclo.
5. Abrir la gráfica para demostrar que las acciones de consulta no cambiaron.
6. Revisar la tarjeta en tamaño de escritorio y móvil.

## 10. Evidencias de implementación

### 10.1 Secuencia de commits

| Commit | Propósito |
|---|---|
| `95c023e1` | Documentar alcance, decisiones y plan de validación. |
| `d74ff5ae` | Aislar las dependencias de las pruebas y crear los fixtures de estado. |
| `f034a281` | Sustituir el booleano invertido por `canFinishTask`. |
| `a59a0b0a` | Mostrar una única acción contextual según el estado. |
| `baf02290` | Incorporar los tres chips semánticos y sus pruebas. |
| `docs(assignments): completar evidencia y guion de demo` | Registrar los resultados finales de la implementación. |

### 10.2 Resultados automatizados

Prueba dirigida de `AssignmentDetail`:

```text
1 suite aprobada
10 pruebas aprobadas
0 snapshots
```

Suite completa del frontend, ejecutada con `--maxWorkers=50%` para reducir el
tiempo respecto de la ejecución secuencial:

```text
60 suites aprobadas
250 pruebas aprobadas
0 snapshots
Tiempo de Jest: 226.438 s
```

Jest conserva una advertencia conocida sobre manejadores asíncronos abiertos y
requiere `--forceExit`, pero todas las pruebas finalizaron correctamente.

Compilación de producción:

```text
TypeScript: correcto
Vite: correcto
12312 módulos transformados
```

Vite mantiene una advertencia preexistente por un chunk superior a 500 kB. No
está relacionada con esta mejora.

Lint dirigido a los cuatro archivos TypeScript/TSX modificados:

```text
0 errores
0 advertencias
```

El lint global no está verde en la rama base: reporta 96 errores y 6
advertencias en archivos no modificados por este trabajo. Entre ellos existen
usos de `any`, variables sin uso y dependencias faltantes de hooks. Corregir esa
deuda queda fuera de este alcance para conservar commits pequeños y evitar
cambios no relacionados.

### 10.3 Comprobación funcional cubierta

- Pendiente: chip gris, **Iniciar tarea** visible y **Finalizar tarea** ausente.
- En progreso: chip ámbar, **Iniciar tarea** ausente y **Finalizar tarea** visible.
- Enviado: chip verde y ambas acciones ausentes.
- **Ver gráfica** continúa presente en los tres escenarios evaluados.
- La vista docente sigue sin mostrar acciones propias del estudiante.
- La compilación confirma que no se alteraron contratos de backend ni tipos
  públicos.

La revisión visual con una sesión y datos reales se realizará durante la demo,
siguiendo el guion de la sección 9. La captura entregada se utilizará como
evidencia del estado anterior.

### 10.4 Publicación

- Cuenta autenticada y verificada mediante GitHub API: `leitocam`.
- Permiso `push` confirmado sobre `UCB-TallerDeDesarrollo/TDDLab`.
- Rama a publicar: `prime-feat/mejora-acciones-estado-tarea`.

## 11. Reversión

Cada incremento tendrá un commit independiente. Si se detecta una regresión,
se podrá revertir únicamente el commit responsable con `git revert <hash>`, sin
eliminar la documentación ni los incrementos anteriores que ya estén
validados.

Para retirar primero los cambios visibles y conservar la infraestructura de
pruebas se puede revertir, en este orden:

```powershell
git revert baf02290
git revert a59a0b0a
```

El refactor `f034a281` puede permanecer porque no cambia el comportamiento. Si
se necesita regresar por completo al punto de partida, se continúa revirtiendo
`f034a281`, `d74ff5ae` y `95c023e1` en ese orden.
