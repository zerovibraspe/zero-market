-- Schema inicial: productos y tickets de descarga (Neon / Postgres)

create extension if not exists pgcrypto;

create table productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  autor_nombre text,
  -- Texto libre: el vendedor crea las categorías que quiera desde el CMS, sin enum fijo.
  categoria text not null,
  portada_url text,
  -- Rutas dentro de /public (ej. "/productos/mi-producto/1.jpg"), servidas desde el repo — no viven en B2.
  fotos jsonb not null default '[]'::jsonb,
  -- Link de YouTube o ruta dentro de /public (video subido al CMS, commiteado a GitHub igual que las fotos).
  video_muestra_url text,
  -- Si está vacío, el botón "Comprar" cae al NEXT_PUBLIC_WHATSAPP_NUMBER general de la tienda.
  whatsapp_numero text,
  archivo_maestro_url text not null,
  precio numeric(10, 2) not null,
  requiere_watermark boolean not null default true,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create table tickets (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references productos(id),
  codigo_licencia text not null unique,
  nombre_comprador text not null,
  celular_comprador text not null,
  posicion_marca_agua text check (posicion_marca_agua in ('tl', 'tr', 'bl', 'br')),
  archivo_personalizado_url text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'descargado', 'expirado')),
  fecha_expiracion timestamptz,
  fecha_creacion timestamptz not null default now(),
  fecha_descarga timestamptz
);

create index idx_tickets_codigo_licencia on tickets(codigo_licencia);
create index idx_tickets_producto_id on tickets(producto_id);

-- Sin Row Level Security: no hay clientes con distintos roles como en Supabase.
-- Todo el acceso pasa por el backend de la app usando la connection string de Neon (server-only).
