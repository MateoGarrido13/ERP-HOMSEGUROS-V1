# Guía de Jira – ERP HOM Seguros

Cómo definimos y organizamos el trabajo en Jira.

## Proyecto

| Dato | Valor |
|---|---|
| Sitio | https://garridomateosys.atlassian.net |
| Proyecto | **ERP Aseguradora** |
| Clave | **ERP** (los issues son `ERP-1`, `ERP-2`, …) |
| Tipo | Software, simplificado (team-managed) |

## Jerarquía

```
Épica                    (agrupa historias de un mismo módulo)
 └── Historia (US)       (una por caso de uso)
      └── Subtarea       (un paso concreto de la historia)
```

- Una subtarea **no puede tener subtareas**: Jira solo permite un nivel.
- Para agrupar subtareas por área usamos **prefijo en el nombre** (ver abajo), no un nivel extra.

## Historias (US)

- **Una historia por caso de uso** de `docs/casos-de-uso/`.
- Tipo de issue: **Historia**.
- Resumen: acción en infinitivo o sustantivo corto, sin prefijo. Ej.: `Iniciar sesión en el ERP`, `Cerrar sesión`.
- Etiquetas: ver la sección [Etiquetas](#etiquetas).
- Descripción con esta estructura:

```
**Como** <rol>
**quiero** <acción>
**para** <beneficio>.

**Caso de uso origen:** CU-XX <nombre> (`ruta/al/archivo.md`)

## Criterios de aceptación
* ...

## Supuestos a confirmar
* ...
```

- Los criterios de aceptación salen del flujo principal, alternativos y reglas de negocio del CU.
- Lo que el CU deja abierto va en **Supuestos a confirmar**, y se mueve a `docs/cuestiones-a-resolver.md` si requiere decisión.

### Ejemplos existentes

| Clave | Historia | Etiquetas |
|---|---|---|
| ERP-5 | Iniciar sesión en el ERP | `CU-01`, `acceso` |
| ERP-8 | Cerrar sesión | `CU-04`, `acceso` |

## Etiquetas

Se escriben en minúscula y con guiones (salvo el código de CU, que va `CU-XX`). Una tarea suele llevar 1 de cada tipo que aplique.

| Tipo | Qué indica | Ejemplos | Se usa en |
|---|---|---|---|
| Caso de uso | CU del repo que origina la historia | `CU-01`, `CU-04` | Historias |
| Módulo / área | Sección del ERP a la que pertenece | `acceso`, `pendientes`, `multicotizador`, `cartera-cliente` | Historias y tareas |
| Naturaleza del trabajo | Qué clase de trabajo es | `spike`, `investigacion`, `arquitectura` | Tareas técnicas |
| Tema técnico | Tecnología o componente involucrado | `base-de-datos` | Tareas técnicas |

Ejemplos en uso:

| Clave | Etiquetas |
|---|---|
| ERP-5 Iniciar sesión en el ERP | `CU-01`, `acceso` |
| ERP-8 Cerrar sesión | `CU-04`, `acceso` |
| ERP-9 [Spike] Investigar y definir la base de datos | **Cerrado** → [ADR-004](ADRs/ADR-004.md). `arquitectura`, `base-de-datos` |

Reglas:
- Las subtareas no llevan etiquetas: el tipo de trabajo va en el prefijo del nombre (`[Diseño]`, `[Dev]`, `[QA]`, ver [Subtareas](#subtareas)).
- Antes de crear una etiqueta nueva, revisar si ya existe una equivalente.
- Los módulos nuevos se agregan a esta tabla cuando aparecen.

## Subtareas

Se crean bajo la historia, con el prefijo del área entre corchetes:

| Prefijo | Para qué | Ejemplos |
|---|---|---|
| `[Diseño]` | Análisis y diseño previo al desarrollo | `[Diseño] Definir caso de uso`, `[Diseño] Wireframe`, `[Diseño] Vista en Figma`, `[Diseño] Spec`, `[Diseño] Revisión de diseño y spec` |
| `[Dev]` | Construcción (por ahora no se crean) | `[Dev] Maquetar vista`, `[Dev] Integrar API`, `[Dev] Backend` |
| `[QA]` | Verificación (por ahora no se crean) | `[QA] Casos de prueba`, `[QA] Validar criterios de aceptación` |

El prefijo cumple el rol de etiqueta en las subtareas: indica el tipo de trabajo y permite filtrar (`summary ~ "[Dev]"`). Se escribe siempre igual: corchetes, primera letra en mayúscula (`[Diseño]`, `[Dev]`, `[QA]`).

### Subtareas estándar de diseño (por historia)

1. `[Diseño] Definir caso de uso`
2. `[Diseño] Wireframe`
3. `[Diseño] Vista en Figma`
4. `[Diseño] Spec`
5. `[Diseño] Revisión de diseño y spec`

Orden de trabajo: CU → Wireframe → Figma → Spec → Revisión. Cada una puede bloquear a la siguiente (enlace "bloquea a").

Tipo de issue en Jira: **Subtask** (así figura en el proyecto).

Ejemplo: las subtareas de ERP-5 son ERP-10 a ERP-14.

> Las subtareas `[Dev]` y `[QA]` se agregan cuando arranque el desarrollo.

## Estados

El flujo del proyecto es: **Por hacer → En curso → En revisión → Finalizado**.

- Una historia pasa a **Finalizado** cuando todas sus subtareas están en Finalizado y se cumplen los criterios de aceptación.

## Enlaces entre issues

Para relacionar issues sin jerarquía se usan enlaces, no subtareas:

- `bloquea a` / `es bloqueado por`: dependencia de orden (Figma bloquea a Spec).
- `relacionado con`: contexto compartido entre historias.

## Buenas prácticas

- Una historia, un caso de uso. Si un CU es muy grande, se parte en varias historias y se comparte la etiqueta `CU-XX`.
- Las etiquetas se escriben siempre igual (`CU-04`, no `cu04`) para poder filtrar.
- Si cambia el CU en el repo, se actualizan los criterios de aceptación de la historia en el mismo momento.
- Ante dudas de alcance, se comenta en la historia en lugar de cambiar los criterios en silencio.

## Filtros útiles (JQL)

```
project = ERP AND labels = acceso
project = ERP AND issuetype = Historia AND status = "Por hacer"
project = ERP AND parent = ERP-5
```
