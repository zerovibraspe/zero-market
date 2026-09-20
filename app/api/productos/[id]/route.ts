import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { productos } from "@/db/schema";
import { subirArchivo } from "@/lib/b2";
import { subirFotosProducto, subirVideoProducto } from "@/lib/github";
import { slugify, carpetaDesdeRuta } from "@/lib/slug";

// Protegido por proxy.ts (matcher incluye /api/productos/:path*) — solo el admin autenticado llega aquí.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [existente] = await db.select().from(productos).where(eq(productos.id, id));
  if (!existente) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  const formData = await req.formData();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const precio = String(formData.get("precio") ?? "");

  if (!nombre || !categoria || !precio) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  // Reemplazo opcional del archivo maestro.
  let archivoMaestroUrl = existente.archivoMaestroUrl;
  const nuevoArchivo = formData.get("archivoMaestro");
  if (nuevoArchivo instanceof File && nuevoArchivo.size > 0) {
    const bytes = Buffer.from(await nuevoArchivo.arrayBuffer());
    archivoMaestroUrl = `productos/${nanoid()}-${nuevoArchivo.name}`;
    await subirArchivo(archivoMaestroUrl, bytes, nuevoArchivo.type || "application/octet-stream");
  }

  // Reusa la carpeta de GitHub existente (de una foto o video previos) para no dispersar archivos del mismo producto.
  const carpeta =
    carpetaDesdeRuta(existente.fotos[0] ?? "") ??
    carpetaDesdeRuta(existente.videoMuestraUrl ?? "") ??
    `${slugify(nombre)}-${nanoid(6)}`;

  const fotosConservadas = formData.getAll("fotosConservadas").map(String);
  const fotosNuevas = formData.getAll("fotosNuevas").filter((f): f is File => f instanceof File && f.size > 0);
  const rutasNuevas = await subirFotosProducto({ carpeta, nombreProducto: nombre, archivos: fotosNuevas });
  const fotos = [...fotosConservadas, ...rutasNuevas];

  let videoMuestraUrl: string | null = existente.videoMuestraUrl;
  const videoArchivo = formData.get("videoArchivo");
  const videoYoutube = String(formData.get("videoYoutube") ?? "").trim();
  if (videoArchivo instanceof File && videoArchivo.size > 0) {
    videoMuestraUrl = await subirVideoProducto({ carpeta, nombreProducto: nombre, archivo: videoArchivo });
  } else if (formData.get("quitarVideo") === "true") {
    videoMuestraUrl = null;
  } else if (videoYoutube) {
    videoMuestraUrl = videoYoutube;
  }

  const [producto] = await db
    .update(productos)
    .set({
      nombre,
      descripcion: String(formData.get("descripcion") ?? "") || null,
      autorNombre: String(formData.get("autorNombre") ?? "") || null,
      categoria,
      fotos,
      videoMuestraUrl,
      archivoMaestroUrl,
      precio,
      requiereWatermark: formData.get("requiereWatermark") === "true",
      activo: formData.get("activo") === "true",
    })
    .where(eq(productos.id, id))
    .returning();

  return NextResponse.json(producto);
}
