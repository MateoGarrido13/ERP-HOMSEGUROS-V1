# Guía de desarrollo Spec-Driven – ERP HOM Seguros

Cómo usamos **specs** y **planes** para diseñar antes de implementar, con la IA haciendo el borrador y nosotros revisando. Complementa la [guía de Jira](guia-jira.md).

Templates listos para copiar:
- [`templates/template-spec.md`](templates/template-spec.md)
- [`templates/template-plan.md`](templates/template-plan.md)

## Idea central

Separar el **qué**, el **cómo** y el **en qué orden**:

| Artefacto | Responde | Contenido | Lo escribe | Lo aprueba |
|---|---|---|---|---|
| **CU / US** | *Qué* y *para qué* | Valor de negocio, flujos y criterios de aceptación | Humano | Humano |
| **Spec** | *Cómo* (diseño) | Solución técnica: componentes, contratos, datos, errores | IA (borrador) | Humano |
| **Plan** | *En qué orden* | Tareas chicas, verificables, con archivos y dependencias | IA (borrador) | Humano |
| **Código + tests** | La implementación | Cumple la spec, sigue el plan | IA | Humano (PR) |

```
CU / US ──► Spec ──► Plan ──► Implementación ──► Validación
 (qué)     (cómo)   (orden)    (código)           (contra criterios)
            ▲          ▲
            └── cada flecha tiene una aprobación humana ──┘
```

La spec **no** repite el CU: lo referencia. El plan **no** redefine el diseño: lo ejecuta. Si al planificar se descubre que falta una decisión de diseño, se vuelve a la spec.

## Por qué lo hacemos

- **Separa el qué del cómo.** Evita que el diseño se improvise mientras se programa.
- **Le da contexto a la IA.** Un agente con una spec aprobada genera código mucho más fiel que uno con un pedido suelto.
- **Permite revisión barata.** Corregir un párrafo de la spec cuesta mucho menos que corregir código ya escrito.
- **Hace visible el diseño.** La spec es una subtarea estimable, asignable y con estado en Jira.

## Política de uso

### Qué hace la IA y qué hacemos nosotros

| La IA | Nosotros |
|---|---|
| Lee el CU, la US y el código existente | Elegimos qué se ataca y con qué alcance |
| Redacta el borrador de spec y de plan | Decidimos las cuestiones de diseño que la IA deja abiertas |
| Marca supuestos y preguntas abiertas | Respondemos las preguntas y corregimos los supuestos |
| Implementa tarea por tarea según el plan | Revisamos cada PR contra la spec |
| Propone actualizar la spec si el código se desvía | Aprobamos o rechazamos el cambio de diseño |

**Regla de oro:** la IA propone, un humano aprueba. Nada pasa de borrador a aprobado sin una persona que lo haya leído entero.

### Reglas

1. **No se implementa sin spec aprobada** cuando la spec es obligatoria (ver [¿Cuándo hace falta?](#cuándo-hace-falta-una-spec)).
2. **No se implementa sin plan aprobado** si el trabajo tiene más de ~3 tareas. Para algo más chico alcanza con la spec.
3. **La IA no inventa lo que no sabe.** Todo dato que no esté en el CU, la US, el código o la conversación va en *Supuestos* o *Preguntas abiertas*, nunca redactado como hecho. Si hay un supuesto sin resolver, la spec no pasa a Aprobada.
4. **El revisor no es el autor del prompt.** Si lo generó una persona, lo revisa la otra. Con dos personas, esto es un cruce simple y vale la pena respetarlo.
5. **Aprobar = leer, no hojear.** Quien aprueba confirma que entiende cada decisión de la spec y que los criterios de aceptación son testeables.
6. **La spec manda sobre el código.** Si el código y la spec discrepan, o se corrige el código o se actualiza la spec en el mismo PR. Nunca se deja la discrepancia.
7. **Un PR no mezcla spec nueva con su implementación.** Primero se mergea la spec aprobada; después viene el código.
8. **Nada de datos sensibles en specs ni prompts:** credenciales, datos reales de clientes o pólizas. Usar datos de ejemplo.

### Qué NO se le delega a la IA sin revisión

- Decisiones de arquitectura, modelo de datos o seguridad.
- Reglas de negocio de seguros (comisiones, descuentos, coberturas, SSN): se validan contra el CU o con quien conoce el dominio.
- Cualquier cosa marcada como *Supuesto*.

## ¿Cuándo hace falta una spec?

| Situación | Spec | Plan |
|---|---|---|
| Toca arquitectura, modelo de datos, APIs o integraciones | **Obligatoria** | **Obligatorio** |
| Pantalla o flujo nuevo con varias piezas (formularios, estados, navegación) | **Obligatoria** | Recomendado |
| Cambio acotado en una pantalla existente | Opcional | No hace falta |
| Trivial (texto, un campo más, ajuste visual) | No | No |

Ante la duda, preguntarse: *¿alguien necesitaría revisar el diseño antes de codear?* Si la respuesta es sí, hay spec.

### ¿Una spec por US o por épica?

- **Por defecto: una spec por US.**
- Si **varias US comparten decisiones técnicas** (mismo modelo de datos, mismo servicio, mismo endpoint), una spec a nivel épica/feature y las US la referencian.
- Evita specs repetidas o contradictorias.

## Tipos de spec

El template tiene un núcleo común y **módulos opcionales** según el tema. Se borran los que no aplican.

| Tipo | Ejemplo | Módulos que importan |
|---|---|---|
| **Pantalla / UI** | Ficha de cliente, listado de siniestros | Pantallas y estados, componentes, navegación, validaciones de formulario |
| **Datos / backend** | Modelo de pólizas, endpoints de cartera | Modelo de datos, contratos, migraciones, permisos |
| **Integración** | Extracción de archivos de compañías, envío por WhatsApp | Contratos externos, errores y reintentos, datos de prueba |
| **Spike / investigación** | Definir la base de datos | En vez de diseño: preguntas, opciones, criterio de decisión, recomendación |

Un spike **no** lleva plan de implementación: su salida es una decisión (que después se vuelve spec).

## Dónde vive todo

Cada trabajo con spec tiene su carpeta en el repo. Spec y plan juntos:

```
docs/specs/
  ERP-5-iniciar-sesion/
    spec.md
    plan.md
  EPICA-multicotizador/        ← specs de épica
    spec.md
```

- Nombre de carpeta: `ERP-<n>-<slug-corto>` (clave de Jira + descripción en minúscula con guiones).
- **No** se escribe la spec en Jira. En Jira queda solo el **link al archivo** en la subtarea `[Diseño] Spec`.
- La spec se revisa por **Pull Request**; el historial de git es el historial de decisiones.

## Formato y convenciones

- **Formato:** Markdown (`.md`), tanto la spec como el plan.
- **Idioma:** español, igual que los CU y la guía de Jira. Los nombres de código (archivos, funciones, endpoints, campos) siguen la convención del código existente.
- **Estructura:** se parte siempre del template. Los módulos opcionales que no aplican se **borran**, pero las secciones que quedan **no se renombran ni se reordenan**, para que cualquiera (y la IA) encuentre cada cosa en el mismo lugar.
- **Encabezado:** tabla con US, CU origen, tipo, estado, autor, revisor y fecha.
- **IDs:** abreviaturas en español, en mayúscula, con guion y número correlativo dentro de cada archivo. Se usan para referenciar desde el plan, los PR y los comentarios.

| ID | Significa | Ejemplo | Dónde |
|---|---|---|---|
| `CA-n` | Criterio de aceptación | `CA-3` | spec, plan (trazabilidad) |
| `RN-n` | Regla de negocio | `RN-2` | spec |
| `SUP-n` | Supuesto sin confirmar | `SUP-1` | spec |
| `PA-n` | Pregunta abierta | `PA-1` | spec |
| `T-n` | Tarea del plan | `T-4` | plan |

Los IDs no se reutilizan: si se elimina `CA-2`, el siguiente criterio nuevo es `CA-5`, no `CA-2`. Los códigos `CU-XX` y `ERP-n` son los que ya existen en el repo y en Jira.

## Estados

Va en el encabezado de cada archivo.

| Artefacto | Estados |
|---|---|
| Spec | `Borrador` → `En revisión` → `Aprobada` → (`Reemplazada`) |
| Plan | `Borrador` → `En revisión` → `Aprobado` → `En ejecución` → `Completado` |

Solo una spec `Aprobada` habilita la implementación. Si más adelante cambia el diseño, se edita la spec y se anota el cambio en su historial.

## El proceso paso a paso

### 1. Preparar el contexto (humano)
- La US existe en Jira con criterios de aceptación y el CU está en `docs/casos-de-uso/`.
- Decidir si requiere spec y plan (tabla de arriba) y si es por US o por épica.
- Identificar qué código existente es relevante (pantallas en `src/app`, componentes en `src/components`, mocks en `src/lib`).

### 2. Generar el borrador de spec (IA)
Pedirle a la IA que redacte `spec.md` desde el template, pasándole como mínimo: la US, el CU y los archivos de código relacionados.

Ejemplo de pedido:
> Redactá la spec de ERP-XX usando `docs/templates/template-spec.md`. Contexto: el CU `<ruta>`, y el código en `<rutas>`. Borrá los módulos que no apliquen. No inventes reglas de negocio: lo que no esté en el CU va en *Supuestos* o *Preguntas abiertas*.

### 3. Revisar la spec (humano)
Usar el [checklist de revisión](#checklist-de-revisión-de-una-spec). Resolver las *Preguntas abiertas* y confirmar o corregir los *Supuestos*. Se itera con la IA hasta que no queden pendientes.

### 4. Aprobar la spec (humano)
- Se abre un PR solo con `spec.md`.
- El otro integrante la revisa y la aprueba; estado pasa a `Aprobada`.
- Se mergea. En Jira, `[Diseño] Spec` y `[Diseño] Revisión de diseño y spec` pasan a Finalizado.

### 5. Generar el plan (IA)
Con la spec aprobada, pedir `plan.md` desde el template. El plan debe descomponer el trabajo en tareas chicas, con archivos concretos y cómo se verifica cada una.

### 6. Revisar y aprobar el plan (humano)
Ver el [checklist del plan](#checklist-de-revisión-de-un-plan). Es una revisión más rápida que la de la spec: lo que importa es el orden, el tamaño de las tareas y que cada una sea verificable.

### 7. Implementar (IA, con supervisión)
- La IA ejecuta **una tarea del plan por vez** y marca el checkbox al terminarla.
- Cada tarea (o grupo chico de tareas) termina en un commit; el PR completo se revisa contra la spec.
- Si la IA descubre que la spec es incompleta o equivocada, **frena y lo avisa**: no decide sola. Se actualiza la spec y se sigue.

### 8. Validar (humano + tests)
Se recorren los criterios de aceptación de la spec uno por uno. Cada criterio queda marcado como cumplido o con una nota de por qué no.

## Checklist de revisión de una spec

- [ ] ¿Referencia la US y el CU correctos, sin copiarlos?
- [ ] ¿El objetivo se entiende en dos líneas?
- [ ] ¿Está claro qué entra y qué **no** entra (fuera de alcance)?
- [ ] ¿Las reglas de negocio coinciden con el CU?
- [ ] ¿Cada criterio de aceptación es **verificable** (se puede decir "pasa" o "no pasa")?
- [ ] ¿Están los casos borde y errores (vacío, inválido, permisos, falla externa)?
- [ ] ¿Las decisiones tomadas tienen su justificación y las descartadas su motivo?
- [ ] ¿Todo lo que la IA no sabía figura como supuesto o pregunta, y no quedó ninguno sin resolver?
- [ ] ¿Es consistente con el código existente y con otras specs?
- [ ] ¿Se puede implementar sin tener que adivinar nada?

## Checklist de revisión de un plan

- [ ] ¿Cada tarea es chica (idealmente < 1 hora de trabajo de la IA, un cambio coherente)?
- [ ] ¿Cada tarea dice **qué archivos** toca y **cómo se verifica**?
- [ ] ¿El orden respeta las dependencias (datos → lógica → UI → pulido)?
- [ ] ¿Cubre todos los criterios de aceptación de la spec? (hay una tabla de trazabilidad)
- [ ] ¿No agrega nada que la spec no pida?
- [ ] ¿Los riesgos y cosas que podrían romperse están identificados?

## Mantenerla viva

Si durante la implementación cambia algo del diseño, **se actualiza la spec en el mismo PR** que cambia el código y se anota en el historial de cambios. Si no, deja de ser fuente de verdad y pierde su valor. El plan, en cambio, es descartable: una vez `Completado` sirve de registro, pero no se mantiene.

## Relación con Jira

| Subtarea Jira | Qué la cierra |
|---|---|
| `[Diseño] Spec` | `spec.md` mergeada con estado `Aprobada` |
| `[Diseño] Revisión de diseño y spec` | Aprobación del segundo integrante en el PR |
| `[Dev] ...` (cuando se creen) | Tareas del `plan.md` completadas |
| `[QA] ...` (cuando se creen) | Criterios de aceptación validados |

La subtarea `[Dev]` queda **bloqueada por** `[Diseño] Spec` hasta que la spec esté aprobada.

## Resumen en una línea

**US/CU → spec (IA propone, humano aprueba, merge) → plan (IA propone, humano aprueba) → código (IA ejecuta, humano revisa PR) → validación contra criterios → spec actualizada si algo cambió.**
