## Estructura del repo

- `docs/`: casos de uso, guías, templates y specs. Fuente de verdad funcional.
- `prototype/`: mockup móvil del flujo PAS (Next.js, datos de ejemplo). Es una referencia visual; no se importa desde `front/` ni `backend/`.
- `front/`: aplicación real. **Next.js** (App Router, TypeScript, Tailwind v4).
- `backend/`: servicios y API (pendiente).

Cada carpeta de código tiene su propio `package.json` y se instala y despliega por separado.

## Stack

- **Front: Next.js** (versión instalada en `front/package.json`). Esta versión tiene cambios respecto de lo que conoce el modelo (por ejemplo, `middleware` ahora es `proxy`): antes de escribir código de Next, leer la guía correspondiente en `front/node_modules/next/dist/docs/`.
- **Base de datos: sin definir.** Candidata: Supabase (PostgreSQL). La decisión es el spike ERP-9. Mientras no se cierre, el código accede a datos solo a través de las interfaces de `front/src/lib/` y no importa ningún SDK de base de datos fuera de la implementación de esa interfaz. No asumir Supabase en specs ni código como hecho; marcarlo como supuesto.

## Diseño

- Figma (wireframes y diseño del ERP): https://www.figma.com/design/dqM3vmFc3i8F3FyKIqiXvD/HOM-Seguros-ERP-–-Diseño (fileKey `dqM3vmFc3i8F3FyKIqiXvD`)

## Desarrollo spec-driven

Trabajamos con spec y plan antes de implementar. Antes de redactar o ejecutar una spec o un plan, leer `docs/guia-spec-driven.md` (proceso y política de uso) y partir de los templates en `docs/templates/`. Las specs y planes viven en `docs/specs/ERP-<n>-<slug>/`.

- No implementar sin spec aprobada cuando la guía la exige.
- No inventar reglas de negocio: lo no documentado va como supuesto o pregunta abierta.
- Si durante la implementación la spec resulta incompleta o incorrecta, frenar y avisar; no decidir solo.
