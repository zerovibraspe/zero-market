# Zero Market

Tienda de productos digitales (PDFs, video-tutoriales, plugins) con protección anti-reventa: marca de agua personalizada, metadata con código de licencia, y descargas temporales de un solo uso.

Ver `CLAUDE.md` para el contexto completo de arquitectura y decisiones de diseño. Ver [`docs/Handoff Tienda de productos digitales — Landing + CMS.md`](docs/Handoff%20Tienda%20de%20productos%20digitales%20—%20Landing%20+%20CMS.md) para la especificación de pantallas y tokens de diseño.

## Stack

- Next.js (App Router) + Tailwind v4, desplegado en Vercel
- Neon (Postgres) + Drizzle ORM — ver `db/schema.ts`
- Backblaze B2 (S3-compatible) para archivos maestros/personalizados — nunca públicos, ver `lib/b2.ts`
- Fotos de producto: **no van a B2**, viven como archivos estáticos en `public/productos/` dentro de este repo (ver sección abajo)
- `pdf-lib` para watermark + metadata de PDF

## Correr en local

```bash
npm install
cp .env.example .env.local   # completa los valores (ver instrucciones dentro del archivo)
npm run dev
```

Si cambias `db/schema.ts`, aplica el cambio a Neon con:

```bash
npm run db:push
```

## Fotos de producto

Se suben directo desde `/admin/productos` (campo "Fotos", selector de archivos normal) — el vendedor
no necesita saber qué es GitHub. Por debajo, `lib/github.ts` las sube vía la API de contenidos de
GitHub a `public/productos/<slug>/` en este mismo repo (no a B2), lo que dispara un redeploy
automático en Vercel; la foto tarda ~1 minuto en verse reflejada mientras termina ese deploy.

Esto es intencional: B2 guarda solo los archivos entregables protegidos (que nunca son públicos),
mientras que las fotos de marketing son estáticas y viajan con cada deploy de Vercel vía GitHub — así
no pagas storage de imágenes en B2 ni expones el bucket.

Requiere un Personal Access Token de GitHub (`GITHUB_TOKEN` en `.env.local`/Vercel):

1. [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)
2. Tipo **Fine-grained**, "Only select repositories" → `zerovibraspe/zero-market`
3. Permiso **Contents: Read and write** (nada más)
4. Copia el token a `GITHUB_TOKEN`

## Estructura del proyecto

```
app/
  page.tsx                       → landing con catálogo de productos (filtro real por categoría)
  productos/[id]/page.tsx        → página de detalle del producto (galería, descripción, CTA)
  descargar/[codigo]/page.tsx    → página de descarga del comprador
  admin/
    login/page.tsx               → login del CMS
    (panel)/page.tsx             → CMS: lista de tickets + stats
    (panel)/productos/page.tsx   → CMS: lista y alta de productos
    (panel)/tickets/nuevo/page.tsx → CMS: generar ticket
  api/
    admin/login|logout/route.ts
    productos/route.ts           → alta de producto (sube archivo maestro a B2)
    tickets/route.ts             → genera ticket + archivo personalizado
    descargar/[codigo]/route.ts  → valida, sirve el archivo desde B2, marca como descargado
lib/
  db.ts, b2.ts, auth.ts, watermark.ts, codigos.ts, tickets.ts, productos.ts
db/
  schema.ts, migrations/
public/productos/                → fotos de producto (ver sección arriba)
proxy.ts                         → protege /admin/* y las API de escritura del CMS
docs/
  Handoff Tienda de productos digitales — Landing + CMS.md
  resumen-ejecutivo.md
CLAUDE.md
drizzle.config.ts
```

## Despliegue

Repo: [github.com/zerovibraspe/zero-market](https://github.com/zerovibraspe/zero-market)

Conecta ese repo a Vercel normalmente desde el dashboard — puede vivir en una cuenta de Vercel distinta a la de GitHub, siempre que esa cuenta de Vercel tenga la GitHub App instalada con acceso al repo. Configura en Vercel las mismas variables de entorno de `.env.local` (Project Settings → Environment Variables), incluyendo `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET` con valores reales (no los de prueba usados en local).
