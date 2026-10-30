## Estructura del repo

- `docs/`: casos de uso, guías, templates y specs. Fuente de verdad funcional.
- `prototype/`: mockup móvil del flujo PAS (Next.js, datos de ejemplo). Es una referencia visual; no se importa desde `front/` ni `backend/`.
- `front/`: aplicación real (pendiente).
- `backend/`: servicios y API (pendiente).

Cada carpeta de código tiene su propio `package.json` y se instala y despliega por separado.

## Desarrollo spec-driven

Trabajamos con spec y plan antes de implementar. Antes de redactar o ejecutar una spec o un plan, leer `docs/guia-spec-driven.md` (proceso y política de uso) y partir de los templates en `docs/templates/`. Las specs y planes viven en `docs/specs/ERP-<n>-<slug>/`.

- No implementar sin spec aprobada cuando la guía la exige.
- No inventar reglas de negocio: lo no documentado va como supuesto o pregunta abierta.
- Si durante la implementación la spec resulta incompleta o incorrecta, frenar y avisar; no decidir solo.
