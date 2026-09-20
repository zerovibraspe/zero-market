import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tickets } from "@/db/schema";
import { urlDescargaFirmada } from "@/lib/b2";
import { ticketVigente } from "@/lib/tickets";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;

  const [ticket] = await db.select().from(tickets).where(eq(tickets.codigoLicencia, codigo));

  if (!ticket) {
    return NextResponse.json({ error: "Código inválido" }, { status: 404 });
  }

  if (!ticketVigente(ticket)) {
    return NextResponse.json({ error: "Este enlace ya no está disponible" }, { status: 410 });
  }

  const key = ticket.archivoPersonalizadoUrl;
  if (!key) {
    return NextResponse.json({ error: "Archivo no disponible" }, { status: 500 });
  }

  const url = await urlDescargaFirmada(key);

  await db
    .update(tickets)
    .set({ estado: "descargado", fechaDescarga: new Date() })
    .where(eq(tickets.id, ticket.id));

  return NextResponse.redirect(url);
}
