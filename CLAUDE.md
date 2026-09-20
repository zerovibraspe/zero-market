# Contexto del proyecto — Zero Market

Este archivo le da contexto a Claude Code sobre el proyecto. Léelo antes de escribir código.

## Qué es esto

Tienda de productos digitales (PDFs, video-tutoriales, plugins/extensiones `.zip`) vendida por WhatsApp a estudiantes y creadores en Perú, con protección anti-reventa mediante:
- Marca de agua personalizada por comprador (nombre + código de licencia), solo para PDFs
- Metadata embebida en el archivo (código de licencia, datos del comprador), en todas las categorías
- Link de descarga temporal de un solo uso

No es una tienda con checkout automatizado. El pago se coordina por WhatsApp (Yape/Plin) y el vendedor genera el ticket manualmente tras confirmar el pago.

Ver [`docs/Handoff Tienda de productos digitales — Landing + CMS.md`](docs/Handoff%20Tienda%20de%20productos%20digitales%20—%20Landing%20+%20CMS.md) para la especificación completa de pantallas, tokens de diseño y flujos (traducida del mockup de Artifact). Este documento es el resumen técnico operativo.

**Marca**: la tienda se llama **Zero Market**.

## Stack

- **Framework:** Next.js (App Router), desplegado en Vercel
- **Base de datos:** Neon (Postgres serverless) + Drizzle ORM — ver `db/schema.ts` y `db/migrations/`
- **Storage de archivos:** Backblaze B2 (S3-compatible, capa gratuita sin tarjeta), vía `@aws-sdk/client-s3` — archivos maestros y personalizados nunca son públicos; se sirven a través de la ruta de descarga de la app, no desde B2 directo
- **Watermarking de PDF:** `pdf-lib` (Node/TS) — NO usar Python, evita manejar dos runtimes en Vercel
- **Video/plugin:** solo metadata (nombre + código de licencia), sin watermark visible quemado. Quemar un watermark visible en video requiere re-encodear con ffmpeg, lo cual puede exceder el límite de tiempo de las funciones serverless de Vercel
- **Auth del CMS:** password simple + cookie de sesión firmada (un solo vendedor, no se necesita proveedor de auth externo)

## Dos superficies de la app

### 1. CMS (vendedor, ruta protegida `/admin`)

- Subir archivo maestro de un producto (PDF, video o plugin), una sola vez por producto, incluyendo el nombre del autor/creador (se imprime en la marca de agua de ese producto — varía por producto, no es un valor global)
- Generar un ticket: elegir producto + ingresar nombre y celular del comprador
- Configurar en qué esquina va la marca de agua (solo aplica si `producto.requiere_watermark`)
- Elegir vencimiento del link (24h / 48h / al primer uso)
- Al generar el ticket, el sistema:
  1. Toma el archivo maestro
  2. Genera una copia personalizada (marca de agua + metadata para PDF; solo metadata para video/plugin)
  3. Sube la copia a B2
  4. Crea el registro del ticket en la base de datos con fecha de expiración (o null si es "al primer uso")
  5. Devuelve el link de descarga (`/descargar/[codigo]`) para copiar y enviar por WhatsApp

### 2. Landing pública + descarga (comprador)

- `/` — catálogo con thumbnail, categoría, título, precio y botón de compra por categoría (PDF/Video/Plugin); filtrado real por categoría implementado (no solo visual)
- Botón de compra → `wa.me/<numero>?text=<mensaje precargado con el nombre del producto>`
- `/productos/[id]` — página de detalle del producto (no estaba en el mockup de 4 pantallas, se agregó después): galería de fotos, descripción larga, autor, precio, CTA de compra. Las fotos (`producto.fotos`) son rutas dentro de `public/productos/` — **viven en el repo de GitHub, no en B2** (decisión explícita: B2 es solo para los archivos entregables protegidos, no para imágenes de marketing). Se suben con un commit normal, luego se referencian por ruta desde el CMS.
- `/descargar/[codigo]` — página mobile-first que:
  1. Valida contra la base de datos si el ticket sigue vigente (no expirado, no usado)
  2. Si es válido: muestra portada, saludo personalizado, número de licencia con aviso de uso exclusivo, aviso de vencimiento, y botón de descarga
  3. Al hacer clic en descargar: sirve el archivo desde B2 y marca el ticket como `descargado` (invalida el link)
  4. Si el ticket ya expiró o fue usado: muestra mensaje correspondiente ("venció" vs "ya fue usado"), nunca el botón de descarga
  5. Código inválido/inexistente: 404 propia, no la genérica de Next.js

## Decisión de arquitectura clave

**El link de descarga nunca apunta directo al archivo en B2.** Apunta a una ruta propia de la app (`/descargar/[codigo]`) que:
1. Busca el ticket en la base de datos por código
2. Verifica `estado` y `fecha_expiracion`
3. Solo si es válido, sirve el archivo (signed URL de B2 de corta duración, o stream directo desde la API route)
4. Actualiza `estado` a `descargado` y `fecha_descarga` inmediatamente después de servir el archivo

Esto es lo que permite controlar la expiración real (por tiempo Y por uso único) server-side, no solo ocultar el botón visualmente en la UI.

## Modelo de datos

Ver `db/schema.ts` (Drizzle) y `db/migrations/0001_init.sql` para el detalle. Resumen:

**productos**
- `id`, `nombre`, `descripcion`, `autor_nombre` (para la marca de agua, definido por producto en el CMS), `categoria` (`pdf` \| `video` \| `plugin` \| `otro`), `portada_url` (legado, ya no se usa desde el CMS), `fotos` (jsonb, array de rutas dentro de `public/productos/` — viven en GitHub, no en B2), `archivo_maestro_url`, `precio`, `requiere_watermark` (bool), `activo` (bool, visible en catálogo)

**tickets**
- `id`, `producto_id` (FK), `codigo_licencia` (único), `nombre_comprador`, `celular_comprador`, `posicion_marca_agua` (`tl`\|`tr`\|`bl`\|`br`, solo si aplica), `archivo_personalizado_url`, `estado` (`pendiente`\|`descargado`\|`expirado`), `fecha_expiracion` (nullable), `fecha_creacion`, `fecha_descarga` (nullable)

No hay Row Level Security: todo el acceso a la DB pasa por el backend de la app con la connection string de Neon (server-only), no hay clientes con roles distintos como en Supabase.

## Fuera de alcance para el MVP

- Pasarela de pago automatizada (Culqi, Mercado Pago, etc.)
- Watermark visible quemado en video
- Panel de analytics avanzado (placeholder de navegación en el sidebar)
- Autenticación de comprador (el "acceso" es el link único, no una cuenta)

## Convenciones de código

- TypeScript en todo el proyecto, incluyendo las funciones serverless
- Nombres de rutas y campos de base de datos en español, siguiendo el dominio del negocio (`productos`, `tickets`, `codigo_licencia`)
- Variables de entorno documentadas en `.env.example`, nunca hardcodeadas
- Accesibilidad: botones reales (`<button>`/`<a href>`, no `div` con `onClick`), inputs con `<label>` asociado, `color-accent` (lima) nunca como color de texto
