import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { productos } from "@/db/schema";
import { subirArchivo } from "@/lib/b2";
import { subirArchivoAGithub } from "@/lib/github";
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

  // Fotos: se guardan en el repo de GitHub (no en B2) para que sean estáticas y públicas sin costo de storage.
  const carpeta = `${slugify(nombre)}-${nanoid(6)}`;
  const archivosFoto = formData.getAll("fotos").filter((f): f is File => f instanceof File && f.size > 0);

  const fotos: string[] = [];
  for (const foto of archivosFoto) {
    const nombreArchivo = `${nanoid(6)}-${slugify(foto.name.replace(/\.[^.]+$/, ""))}${foto.name.match(/\.[^.]+$/)?.[0] ?? ""}`;
    const rutaRepo = `public/productos/${carpeta}/${nombreArchivo}`;
    const bytesFoto = Buffer.from(await foto.arrayBuffer());
    await subirArchivoAGithub({
      ruta: rutaRepo,
      contenido: bytesFoto,
      mensaje: `Foto de producto: ${nombre}`,
    });
    fotos.push(`/productos/${carpeta}/${nombreArchivo}`);
  }

  const [producto] = await db
    .insert(productos)
    .values({
      nombre,
      descripcion: String(formData.get("descripcion") ?? "") || null,
      autorNombre: String(formData.get("autorNombre") ?? "") || null,
      categoria,
      fotos,
      archivoMaestroUrl: key,
      precio,
      requiereWatermark: formData.get("requiereWatermark") === "true",
      activo: true,
    })
    .returning();

  return NextResponse.json(producto, { status: 201 });
}
