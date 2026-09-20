import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { productos } from "@/db/schema";
import { subirArchivo } from "@/lib/b2";
import { subirFotosProducto, subirVideoProducto } from "@/lib/github";
import { slugify } from "@/lib/slug";

// Protegido por proxy.ts (matcher incluye /api/productos/:path*) — solo el admin autenticado llega aquí.
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const archivo = formData.get("archivoMaestro");

  if (!(archivo instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo maestro" }, { status: 400 });
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const precio = String(formData.get("precio") ?? "");

  if (!nombre || !categoria || !precio) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const bytes = Buffer.from(await archivo.arrayBuffer());
  const key = `productos/${nanoid()}-${archivo.name}`;
  await subirArchivo(key, bytes, archivo.type || "application/octet-stream");

  // Fotos y video de muestra se guardan en el repo de GitHub (no en B2), estáticos y sin costo de storage.
  const carpeta = `${slugify(nombre)}-${nanoid(6)}`;
  const archivosFoto = formData.getAll("fotos").filter((f): f is File => f instanceof File && f.size > 0);
  const fotos = await subirFotosProducto({ carpeta, nombreProducto: nombre, archivos: archivosFoto });

  const videoArchivo = formData.get("videoArchivo");
  const videoYoutube = String(formData.get("videoYoutube") ?? "").trim();
  let videoMuestraUrl: string | null = null;
  if (videoArchivo instanceof File && videoArchivo.size > 0) {
    videoMuestraUrl = await subirVideoProducto({ carpeta, nombreProducto: nombre, archivo: videoArchivo });
  } else if (videoYoutube) {
    videoMuestraUrl = videoYoutube;
  }

  const [producto] = await db
    .insert(productos)
    .values({
      nombre,
      descripcion: String(formData.get("descripcion") ?? "") || null,
      autorNombre: String(formData.get("autorNombre") ?? "") || null,
      categoria,
      fotos,
      videoMuestraUrl,
      archivoMaestroUrl: key,
      precio,
      requiereWatermark: formData.get("requiereWatermark") === "true",
      activo: true,
    })
    .returning();

  return NextResponse.json(producto, { status: 201 });
}
