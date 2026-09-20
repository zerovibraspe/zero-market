import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { productos, tickets } from "@/db/schema";
import { descargarArchivo, subirArchivo } from "@/lib/b2";
import { generarCodigoLicencia } from "@/lib/codigos";
import { personalizarArchivo } from "@/lib/watermark";
import { calcularFechaExpiracion, type Vencimiento } from "@/lib/tickets";

// Protegido por proxy.ts (matcher incluye /api/tickets/:path*) — solo el admin autenticado llega aquí.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productoId, nombreComprador, celularComprador, posicionMarcaAgua, vencimiento } = body as {
    productoId: string;
    nombreComprador: string;
    celularComprador: string;
    posicionMarcaAgua: "tl" | "tr" | "bl" | "br" | null;
    vencimiento: Vencimiento;
  };

  if (!productoId || !nombreComprador?.trim() || !celularComprador?.trim()) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const [producto] = await db.select().from(productos).where(eq(productos.id, productoId));
  if (!producto) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  const archivoOriginal = await descargarArchivo(producto.archivoMaestroUrl);
  const codigoLicencia = generarCodigoLicencia();

  const archivoPersonalizado = await personalizarArchivo({
    categoria: producto.categoria,
    archivoOriginal,
    nombreComprador: nombreComprador.trim(),
    codigoLicencia,
    autorNombre: producto.autorNombre,
    esquina: producto.requiereWatermark ? (posicionMarcaAgua ?? "br") : null,
  });

  const nombreArchivo = producto.archivoMaestroUrl.split("/").pop() ?? "archivo";
  const key = `tickets/${codigoLicencia}-${nombreArchivo}`;
  await subirArchivo(key, Buffer.from(archivoPersonalizado), "application/octet-stream");

  const [ticket] = await db
    .insert(tickets)
    .values({
      productoId,
      codigoLicencia,
      nombreComprador: nombreComprador.trim(),
      celularComprador: celularComprador.trim(),
      posicionMarcaAgua: producto.requiereWatermark ? (posicionMarcaAgua ?? "br") : null,
      archivoPersonalizadoUrl: key,
      estado: "pendiente",
      fechaExpiracion: calcularFechaExpiracion(vencimiento ?? "24h"),
    })
    .returning();

  return NextResponse.json(
    { ...ticket, urlDescarga: `/descargar/${ticket.codigoLicencia}` },
    { status: 201 },
  );
}
