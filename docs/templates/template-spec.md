<!--
TEMPLATE DE SPEC. Copiar a docs/specs/ERP-<n>-<slug>/spec.md
Guía: docs/guia-spec-driven.md

Instrucciones para quien lo completa (humano o IA):
- Borrar los módulos opcionales (marcados "[OPCIONAL]") que no apliquen al tema.
- Borrar estos comentarios al terminar.
- No inventar: lo que no esté en el CU, la US o el código va en "Supuestos" o "Preguntas abiertas".
- Una spec solo pasa a "Aprobada" sin supuestos ni preguntas pendientes.
- Los criterios de aceptación deben poder responderse con "pasa" / "no pasa".
-->

# Spec: <nombre> (ERP-XXX)

| | |
|---|---|
| **US** | ERP-XXX · <link a Jira> |
| **Épica** | <si aplica> |
| **CU origen** | CU-XX `docs/casos-de-uso/.../CU-XX-....md` |
| **Tipo** | Pantalla/UI · Datos/backend · Integración · Spike |
| **Estado** | Borrador · En revisión · Aprobada · Reemplazada |
| **Autor** | <persona + "con IA"> |
| **Revisor** | <persona> |
| **Fecha** | AAAA-MM-DD |

## 1. Contexto y objetivo

<Qué problema resuelve y para quién, en 2–5 líneas. No copiar el CU: referenciarlo.>

**Objetivo:** <una frase verificable>

## 2. Alcance

**Dentro:**
- ...

**Fuera de alcance:**
- ...

## 3. Componentes afectados

| Qué | Dónde | Cambio |
|---|---|---|
| Pantalla | `src/app/...` | nueva / modificada |
| Componente | `src/components/...` | nuevo / modificado |
| Lógica / datos | `src/lib/...` | nuevo / modificado |

## 4. Diseño

<Cómo se resuelve. Explicar las decisiones, no solo el resultado. Incluir un diagrama simple si ayuda.>

### 4.1 Flujo
<Pasos del flujo principal tal como los implementa la solución. Flujos alternativos que requieren manejo especial.>

### 4.2 Pantallas y estados [OPCIONAL – UI]
| Pantalla / componente | Estados (cargando, vacío, error, éxito, deshabilitado) | Comportamiento |
|---|---|---|

- Navegación de entrada y de salida:
- Validaciones de formulario (campo → regla → mensaje):
- Referencia de diseño: <link a Figma / wireframe>

### 4.3 Modelo de datos [OPCIONAL – datos]
| Entidad | Campos (tipo) | Relaciones | Notas |
|---|---|---|---|

- Migraciones / datos iniciales:
- Datos mock vs. datos reales (qué se mockea hoy y qué cambia después):

### 4.4 Contratos [OPCIONAL – backend / integración]
```
METHOD /ruta
Request:  { ... }
Response: { ... }
Errores:  400 ..., 401 ..., 404 ...
```
- Autenticación y permisos (qué rol puede qué):
- Servicios externos, formatos de archivo, límites:

### 4.5 Spike [OPCIONAL – solo si Tipo = Spike]
- **Pregunta a responder:**
- **Opciones evaluadas:** (pros / contras / costo)
- **Criterio de decisión:**
- **Recomendación:**

## 5. Reglas de negocio

<Reglas del dominio que esta solución debe respetar, con referencia al CU. Si alguna no está documentada, va a "Supuestos".>

| # | Regla | Origen |
|---|---|---|
| RN-1 | ... | CU-XX |

## 6. Casos borde y manejo de errores

| Situación | Comportamiento esperado |
|---|---|
| Datos vacíos | ... |
| Datos inválidos | ... |
| Usuario sin permiso | ... |
| Falla de servicio externo | ... |
| Doble envío / acción repetida | ... |

## 7. Criterios de aceptación verificables

- [ ] CA-1: ...
- [ ] CA-2: ...

> Cada criterio se valida al final. Si un criterio no se puede testear, reformularlo.

## 8. Decisiones descartadas

| Alternativa | Por qué no |
|---|---|
| ... | ... |

## 9. Supuestos

<Cosas que se asumieron sin confirmar. **Deben quedar vacíos antes de aprobar**: cada uno se confirma (y pasa a ser regla o decisión) o se mueve a `docs/cuestiones-a-resolver.md`.>

- [ ] SUP-1: ... → *confirmado por: ___*

## 10. Preguntas abiertas

- [ ] PA-1: ... → *respuesta / quién decide: ___*

## 11. Historial de cambios

| Fecha | Cambio | Motivo | PR |
|---|---|---|---|
| AAAA-MM-DD | Versión inicial | | |
