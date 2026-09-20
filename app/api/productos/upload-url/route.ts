import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { urlSubidaFirmada } from "@/lib/b2";

// Protegido por proxy.ts (matcher incluye /api/productos/:path*).
// Devuelve una URL firmada para que el navegador suba el archivo maestro directo a B2,
// evitando el límite de 4.5 MB del body de las funciones serverless de Vercel.
export async function POST(req: NextRequest) {
  const { nombreArchivo, contentType } = await req.json();

  if (!nombreArchivo) {
    return NextResponse.json({ error: "Falta el nombre del archivo" }, { status: 400 });
  }

  const key = `productos/${nanoid()}-${nombreArchivo}`;
  const url = await urlSubidaFirmada(key, contentType || "application/octet-stream");

  return NextResponse.json({ key, url });
}
