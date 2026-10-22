# Guía de desarrollo Spec-Driven – ERP HOM Seguros

Cómo usamos **specs** (especificaciones técnicas) para diseñar antes de implementar. Complementa la [guía de Jira](guia-jira.md).

## Idea central

Separar el **qué** del **cómo**:

| Artefacto | Responde | Contenido |
|---|---|---|
| **US (Historia)** | *Qué* y *para qué* | Valor de negocio y criterios de aceptación |
| **Spec** | *Cómo* | Solución técnica: componentes, contratos, datos, errores |

La US no se mezcla con decisiones técnicas, y la implementación no arranca sin diseño aprobado.

## Por qué lo hacemos

- **Separa el qué del cómo.** Evita que el diseño se improvise mientras se programa.
- **Hace visible el diseño.** La spec es una task estimable, asignable y con estado en Jira, no trabajo invisible.
- **Permite revisión previa.** Se aprueba la spec antes de escribir código, que es cuando corregir sale más barato.

## ¿Cuándo hace falta una spec?

| Situación | Spec |
|---|---|
| Toca arquitectura, modelo de datos, APIs o integraciones | **Obligatoria** |
| Cambio acotado y trivial (texto, un campo más, ajuste visual) | **Opcional** (puede omitirse) |

Una spec formal para un cambio trivial es sobrecosto: ante la duda, preguntarse si alguien necesitaría revisar el diseño antes de codear.

## ¿Una spec por US o por épica?

- **Por defecto: una spec por US.**
- Si **varias US comparten decisiones técnicas** (mismo modelo de datos, mismo servicio, mismo endpoint), conviene **una spec a nivel épica o feature** y que las US la referencien.
- Así se evitan specs repetidas o contradictorias entre sí.

## Dónde vive la spec

- En el **repositorio**, como archivo versionado: `front/docs/specs/US-123-nombre.md` (o `ERP-123-nombre.md`, según la clave de Jira).
- Para specs de épica: `front/docs/specs/EPICA-nombre.md`.
- **No** se escribe como comentario ni descripción en Jira. En Jira queda **solo el link** al archivo.

Ventajas: el desarrollador o el agente de IA la lee como contexto, se revisa por Pull Request y evoluciona junto al código.

## Estructura de tasks por US

Cada US con spec se divide en tres subtareas (ver jerarquía en la guía de Jira):

| # | Subtarea | Resultado |
|---|---|---|
| 1 | **Redactar y aprobar spec** | Archivo de spec mergeado vía PR |
| 2 | **Implementar según spec** | Código que cumple la spec |
| 3 | **Tests / validación** | Verificación contra los criterios de aceptación |

**Regla de bloqueo:** la Task 2 queda **bloqueada hasta que la Task 1 esté aprobada**.

```
US-123
 ├── Task 1: Redactar y aprobar spec   ──► (aprobada)
 ├── Task 2: Implementar según spec    ◄── bloqueada por Task 1
 └── Task 3: Tests / validación
```

## Qué debe tener una spec

1. **Contexto y objetivo:** qué problema resuelve y link a la US.
2. **Stack y componentes afectados:** módulos, pantallas, servicios, tablas.
3. **Contratos:** endpoints, esquemas de request/response, eventos.
4. **Modelo de datos:** entidades, campos, relaciones, migraciones.
5. **Casos borde y manejo de errores:** qué pasa cuando algo falla o llega vacío/inválido.
6. **Criterios de aceptación verificables:** condiciones concretas que se puedan testear.
7. **Decisiones descartadas:** alternativas evaluadas y por qué no se eligieron.
8. **Fuera de alcance:** lo que explícitamente no se hace.

> Mientras más verificable sea la spec, mejor sirve después para generar código y tests.

### Plantilla

```markdown
# Spec: <nombre> (ERP-XXX)

- **US:** ERP-XXX · **Épica:** <si aplica>
- **Estado:** Borrador | En revisión | Aprobada
- **Autor / Revisor:**

## 1. Contexto y objetivo
## 2. Stack y componentes afectados
## 3. Contratos (endpoints, esquemas, eventos)
## 4. Modelo de datos
## 5. Casos borde y manejo de errores
## 6. Criterios de aceptación verificables
- [ ] ...
## 7. Decisiones descartadas
## 8. Fuera de alcance
```

## Mantenerla viva

Si durante la implementación cambia algo del diseño, **se actualiza la spec en el mismo PR** que cambia el código. Si no, deja de ser fuente de verdad y pierde su valor.

## Flujo resumido

1. Se define la US (qué y para qué, criterios de aceptación).
2. Se decide si requiere spec (obligatoria / opcional) y si es por US o por épica.
3. Task 1: se redacta la spec en `front/docs/specs/`, se abre PR y se aprueba.
4. Task 2: se implementa siguiendo la spec; si algo cambia, se actualiza la spec.
5. Task 3: se valida contra los criterios de aceptación.
