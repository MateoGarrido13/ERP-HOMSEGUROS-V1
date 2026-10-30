# HOM · prototipo PAS

Mockup móvil del flujo del productor: cotizar, comparar, propuesta, cartera y cobranzas. Usa datos de ejemplo, sin backend.

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). El recorrido arranca en el ingreso.

## Deploy

Vercel o Netlify: importar el repo y configurar **Root Directory = `prototype`**. Framework Next.js detectado automáticamente, build `npm run build`, sin variables de entorno.

Para evitar redeploys cuando cambian otras carpetas, en Vercel: *Settings → Git → Ignored Build Step*:

```bash
git diff --quiet HEAD^ HEAD -- .
```
