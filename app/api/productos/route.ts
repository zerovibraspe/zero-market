import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { productos } from "@/db/schema";
import { subirArchivo } from "@/lib/b2";

// Protegido por proxy.ts (matcher incluye /api/productos/:path*) — solo el admin autenticado llega aquí.
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const archivo = formData.get("archivoMaestro");

  if (!(archivo instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo maestro" }, { status: 400 });
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "");
  const precio = String(formData.get("precio") ?? "");

  if (!nombre || !["pdf", "video", "plugin", "otro"].includes(categoria) || !precio) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const bytes = Buffer.from(await archivo.arrayBuffer());
  const key = `productos/${nanoid()}-${archivo.name}`;
  await subirArchivo(key, bytes, archivo.type || "application/octet-stream");

  const fotos = String(formData.get("fotos") ?? "")
    .split(",")
    .map((ruta) => ruta.trim())
    .filter(Boolean);

  const [producto] = await db
    .insert(productos)
    .values({
      nombre,
      descripcion: String(formData.get("descripcion") ?? "") || null,
      autorNombre: String(formData.get("autorNombre") ?? "") || null,
      categoria: categoria as "pdf" | "video" | "plugin" | "otro",
      fotos,
      archivoMaestroUrl: key,
      precio,
      requiereWatermark: formData.get("requiereWatermark") === "true",
      activo: true,
    })
    .returning();

  return NextResponse.json(producto, { status: 201 });
}
