Fotos de producto — a propósito viven aquí (repo de GitHub/Vercel) y no en Backblaze B2.

No se editan a mano: el CMS (`/admin/productos`) las sube automáticamente vía la API de contenidos
de GitHub (`lib/github.ts`) cuando el vendedor selecciona archivos en el campo "Fotos" al crear un
producto. Cada subida crea un commit en `public/productos/<slug-del-producto>/`, lo que dispara un
redeploy automático en Vercel (~1 minuto hasta que la foto se vea en la página).

Requiere las variables `GITHUB_TOKEN`, `GITHUB_REPO` y `GITHUB_BRANCH` — ver `.env.example`.
