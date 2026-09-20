# Resumen ejecutivo: Plataforma "Psicología desde Cero"

**Objetivo:** Plataforma de venta de recursos digitales (PDFs y videos) con protección anti-reventa mediante watermarking personalizado y descargas temporales de un solo uso.

## Contexto del negocio

- Producto: PDFs educativos de psicología (6 módulos + material adicional), contenido creado por Stephanie Martinez
- Precio: pack completo S/10
- Público: estudiantes de psicología de 1er-2do año e interesados en la carrera
- Venta: vía WhatsApp (pago Yape/Plin), sin pasarela de pago automatizada por ahora

## Stack recomendado

- **Frontend/Backend:** Next.js en Vercel
- **Watermarking PDF:** `pdf-lib` (Node/TS) — evitar Python para no manejar dos runtimes en Vercel
- **Base de datos:** Supabase o Vercel Postgres (tabla de tickets)
- **Storage de archivos:** Vercel Blob o Cloudflare R2
- **Video:** solo metadata (nombre + código), sin watermark visible quemado (evitar límites de tiempo de funciones serverless con ffmpeg)

## Flujo del vendedor (Miguel)

1. Sube archivo maestro al CMS (una vez por producto)
2. Genera un ticket: elige producto, ingresa nombre/celular del comprador
3. El sistema genera automáticamente:
   - PDF personalizado con marca de agua (posición configurable en 1 de 4 esquinas) + metadata con código de licencia y nombre del comprador
   - Video con metadata (código + datos del comprador) sin marca visible
4. Se genera un link temporal único (expira por tiempo configurable o al primer uso)

## Flujo del comprador

1. Ve el listado de productos en la landing principal
2. Botón de compra → deriva a WhatsApp con mensaje precargado (`wa.me/...?text=...`)
3. Tras el pago, recibe su link personal
4. En la página de descarga ve: preview/portada, descripción, número de licencia con aviso de prohibición de reproducción, botón de descarga
5. Al descargar (o al vencer el tiempo), el link se invalida

## Modelo de datos (mínimo)

**Productos:** id, nombre, descripción, portada, archivo_maestro_url, tipo (pdf/video)

**Tickets:** id, producto_id, código_licencia, nombre_comprador, celular_comprador, archivo_personalizado_url, estado (pendiente/descargado/expirado), fecha_expiración

## Decisión de arquitectura clave

El link de descarga **no apunta directo al archivo** — apunta a una ruta propia (`/descargar/[codigo]`) que valida contra la base de datos si el ticket sigue vigente, y solo ahí sirve el archivo. Así se controla la expiración real, no solo visualmente.

## Fuera de alcance para el MVP

- Pasarela de pago automatizada
- Watermark visible quemado en video
- Panel de analytics avanzado
