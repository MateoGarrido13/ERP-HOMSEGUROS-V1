## Estructura del repo

- `docs/`: casos de uso, guías, templates y specs. Fuente de verdad funcional.
- `prototype/`: mockup móvil del flujo PAS (Next.js, datos de ejemplo). Es una referencia visual; no se importa desde `front/` ni `backend/`.
- `front/`: aplicación real. **Next.js** (App Router, TypeScript, Tailwind v4).
- `backend/`: servicios y API (pendiente).

Cada carpeta de código tiene su propio `package.json` y se instala y despliega por separado.

## Stack

- **Front: Next.js** (versión instalada en `front/package.json`). Esta versión tiene cambios respecto de lo que conoce el modelo (por ejemplo, `middleware` ahora es `proxy`): antes de escribir código de Next, leer la guía correspondiente en `front/node_modules/next/dist/docs/`.
- **Plataforma: Supabase** (PostgreSQL, Auth, Edge Functions). Cierra el spike ERP-9. Decisión: [`docs/ADRs/ADR-004.md`](docs/ADRs/ADR-004.md).
- **Hub de aseguradoras:** Edge Functions (TypeScript/Deno), módulo de integraciones aislado (ACL + Aggregator, timeout 4 s). Go solo si ese Aggregator con circuit breaker se vuelve un cuello **medido**.
- **Acceso a datos en `front/`:** solo a través de las interfaces de `front/src/lib/`. No importar el SDK de Supabase (ni otro cliente de base) fuera de la implementación de esa interfaz. El prototipo no se importa.

## Diseño

- Figma (wireframes y diseño del ERP): https://www.figma.com/design/dqM3vmFc3i8F3FyKIqiXvD/HOM-Seguros-ERP-–-Diseño (fileKey `dqM3vmFc3i8F3FyKIqiXvD`)

## Desarrollo spec-driven

Trabajamos con spec y plan antes de implementar. Antes de redactar o ejecutar una spec o un plan, leer `docs/guia-spec-driven.md` (proceso y política de uso) y partir de los templates en `docs/templates/`. Las specs y planes viven en `docs/specs/ERP-<n>-<slug>/`.

- No implementar sin spec aprobada cuando la guía la exige.
- No inventar reglas de negocio: lo no documentado va como supuesto o pregunta abierta.
- Si durante la implementación la spec resulta incompleta o incorrecta, frenar y avisar; no decidir solo.
