import {
  pgTable,
  uuid,
  text,
  numeric,
  boolean,
  timestamp,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

export const productos = pgTable("productos", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  autorNombre: text("autor_nombre"),
  // Texto libre: el vendedor puede crear las categorías que quiera desde el CMS, no está
  // limitado a un enum fijo. "pdf"/"video"/"plugin" son solo sugerencias iniciales.
  categoria: text("categoria").notNull(),
  portadaUrl: text("portada_url"),
  // Rutas dentro de /public (ej. "/productos/mi-producto/1.jpg"), servidas desde el propio
  // repo de GitHub/Vercel — a propósito no viven en B2, ver README "Fotos de producto".
  fotos: jsonb("fotos").$type<string[]>().notNull().default([]),
  archivoMaestroUrl: text("archivo_maestro_url").notNull(),
  precio: numeric("precio", { precision: 10, scale: 2 }).notNull(),
  requiereWatermark: boolean("requiere_watermark").notNull().default(true),
  activo: boolean("activo").notNull().default(true),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
});

export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productoId: uuid("producto_id")
      .notNull()
      .references(() => productos.id),
    codigoLicencia: text("codigo_licencia").notNull().unique(),
    nombreComprador: text("nombre_comprador").notNull(),
    celularComprador: text("celular_comprador").notNull(),
    posicionMarcaAgua: text("posicion_marca_agua", {
      enum: ["tl", "tr", "bl", "br"],
    }),
    archivoPersonalizadoUrl: text("archivo_personalizado_url"),
    estado: text("estado", {
      enum: ["pendiente", "descargado", "expirado"],
    })
      .notNull()
      .default("pendiente"),
    fechaExpiracion: timestamp("fecha_expiracion", { withTimezone: true }),
    fechaCreacion: timestamp("fecha_creacion", { withTimezone: true })
      .notNull()
      .defaultNow(),
    fechaDescarga: timestamp("fecha_descarga", { withTimezone: true }),
  },
  (table) => ({
    codigoLicenciaIdx: index("idx_tickets_codigo_licencia").on(table.codigoLicencia),
    productoIdIdx: index("idx_tickets_producto_id").on(table.productoId),
  }),
);
