<!--
TEMPLATE DE PLAN. Copiar a front/docs/specs/ERP-<n>-<slug>/plan.md
Guía: front/docs/guia-spec-driven.md

Instrucciones para quien lo completa (humano o IA):
- Solo se escribe con la spec en estado "Aprobada". El plan ejecuta la spec, no la redefine.
- Si al planificar falta una decisión de diseño: parar y volver a la spec.
- Tareas chicas: un cambio coherente, verificable por sí solo, idealmente un commit.
- Cada tarea nombra los archivos que toca y cómo se verifica.
- No agregar tareas que la spec no pida.
- Borrar estos comentarios al terminar.
-->

# Plan: <nombre> (ERP-XXX)

| | |
|---|---|
| **Spec** | [`spec.md`](spec.md) (versión aprobada: AAAA-MM-DD) |
| **US** | ERP-XXX |
| **Estado** | Borrador · En revisión · Aprobado · En ejecución · Completado |
| **Autor** | <persona + "con IA"> |
| **Revisor** | <persona> |

## 1. Resumen del enfoque

<2–4 líneas: en qué orden se construye y por qué. Ej.: primero datos y lógica con mocks, después la pantalla, al final el pulido.>

## 2. Antes de empezar

- [ ] Spec en estado `Aprobada`, sin supuestos ni preguntas abiertas.
- [ ] Rama creada: `<nombre-de-rama>`
- [ ] Dependencias previas resueltas: <otras US / tareas / decisiones>

## 3. Tareas

> Orden = orden de ejecución. Marcar `[x]` al terminar cada una.

### Fase 1 – <ej.: Datos y lógica>

- [ ] **T-1 – <título corto en infinitivo>**
  - **Qué:** <cambio concreto>
  - **Archivos:** `src/lib/...` (nuevo), `src/components/...` (modificar)
  - **Depende de:** — 
  - **Cubre:** CA-1, RN-1
  - **Verificación:** <comando o prueba manual concreta, ej.: `npm run lint` pasa; la pantalla X muestra Y>

- [ ] **T-2 – ...**
  - **Qué:**
  - **Archivos:**
  - **Depende de:** T-1
  - **Cubre:**
  - **Verificación:**

### Fase 2 – <ej.: Interfaz>

- [ ] **T-3 – ...**

### Fase 3 – <ej.: Casos borde y pulido>

- [ ] **T-4 – ...**

## 4. Trazabilidad con la spec

Cada criterio de aceptación debe tener al menos una tarea.

| Criterio de la spec | Tareas |
|---|---|
| CA-1 | T-1, T-3 |
| CA-2 | T-2 |

## 5. Riesgos y puntos de atención

| Riesgo | Mitigación / cómo detectarlo |
|---|---|
| <ej.: cambia un componente compartido que usan otras pantallas> | <revisar usos en `src/app/...`> |

## 6. Validación final

- [ ] `npm run lint` sin errores
- [ ] `npm run build` pasa
- [ ] Todos los criterios de aceptación de la spec recorridos y marcados
- [ ] Spec actualizada si el diseño cambió durante la implementación
- [ ] PR abierto, revisado por <persona>

## 7. Bitácora de ejecución

<La IA anota acá lo relevante: desvíos respecto del plan, decisiones menores, tareas que se partieron o se agregaron, y por qué.>

| Fecha | Tarea | Nota |
|---|---|---|
