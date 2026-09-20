import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { productos } from "@/db/schema";
import { subirFotosProducto, subirVideoProducto } from "@/lib/github";
import { slugify } from "@/lib/slug";

// Protegido por proxy.ts (matcher incluye /api/productos/:path*) — solo el admin autenticado llega aquí.
export async function POST(req: NextRequest) {
  const formData = await req.formData();

  // El archivo maestro ya se subió directo a B2 desde el navegador (ver /api/productos/upload-url)
  // para evitar el límite de 4.5 MB del body de las funciones serverless de Vercel.
  const archivoMaestroUrl = String(formData.get("archivoMaestroKey") ?? "");

  if (!archivoMaestroUrl) {
    return NextResponse.json({ error: "Falta el archivo maestro" }, { status: 400 });
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const precio = String(formData.get("precio") ?? "");

  if (!nombre || !categoria || !precio) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

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
      whatsappNumero: String(formData.get("whatsappNumero") ?? "").replace(/\D/g, "") || null,
      categoria,
      fotos,
      videoMuestraUrl,
      archivoMaestroUrl,
      precio,
      requiereWatermark: formData.get("requiereWatermark") === "true",
      activo: true,
    })
    .returning();

  return NextResponse.json(producto, { status: 201 });
}
