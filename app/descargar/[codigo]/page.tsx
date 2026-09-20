import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { tickets, productos } from "@/db/schema";
import { ticketVigente } from "@/lib/tickets";
import { CATEGORIA_LABEL } from "@/lib/productos";
import { IconoCategoria } from "@/app/components/IconoCategoria";

export const dynamic = "force-dynamic";

export default async function DescargaPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;

  const filas = await db
    .select({
      estado: tickets.estado,
      fechaExpiracion: tickets.fechaExpiracion,
      nombreComprador: tickets.nombreComprador,
      codigoLicencia: tickets.codigoLicencia,
      productoNombre: productos.nombre,
      productoCategoria: productos.categoria,
      portadaUrl: productos.portadaUrl,
    })
    .from(tickets)
    .innerJoin(productos, eq(tickets.productoId, productos.id))
    .where(eq(tickets.codigoLicencia, codigo));

  const ticket = filas[0];
  if (!ticket) notFound();

  const vigente = ticketVigente(ticket);
  const yaUsado = ticket.estado === "descargado";

  return (
    <div className="flex-1 flex flex-col max-w-[390px] mx-auto w-full px-6 py-10">
      <header className="text-center mb-8">
        <span className="font-display font-bold">Zero Market</span>
      </header>

      <div className="bg-surface-alt rounded-2xl aspect-[4/3] flex items-center justify-center mb-6">
        {ticket.portadaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ticket.portadaUrl} alt={ticket.productoNombre} className="w-full h-full object-cover rounded-2xl" />
        ) : (
          <IconoCategoria categoria={ticket.productoCategoria} className="w-12 h-12 text-accent-dark" />
        )}
      </div>

      <span className="inline-flex self-start px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-tint text-accent-dark mb-2">
        {CATEGORIA_LABEL[ticket.productoCategoria]}
      </span>
      <h1 className="font-display font-bold text-xl mb-1 break-words">{ticket.productoNombre}</h1>
      <p className="text-muted text-sm mb-6 line-clamp-2">Hola, {ticket.nombreComprador}</p>

      <div className="bg-surface border border-border rounded-2xl p-4 mb-4">
        <p className="text-xs text-muted mb-1">Código de licencia</p>
        <p className="font-mono font-semibold">{ticket.codigoLicencia}</p>
        <p className="text-xs text-muted mt-2">Uso exclusivo del comprador — prohibida su reventa o reproducción.</p>
      </div>

      {vigente && (
        <p className="text-xs text-warn bg-warn-bg rounded-lg px-3 py-2 mb-6">
          {ticket.fechaExpiracion
            ? `Este enlace vence el ${new Date(ticket.fechaExpiracion).toLocaleString("es-PE")}.`
            : "Este enlace se invalida apenas lo uses."}
        </p>
      )}

      <div className="flex-1" />

      {vigente ? (
        <a
          href={`/api/descargar/${ticket.codigoLicencia}`}
          className="block text-center py-3.5 rounded-full bg-accent text-ink font-semibold sticky bottom-4"
        >
          Descargar mi pack
        </a>
      ) : (
        <div className="text-center py-6 border border-dashed border-border rounded-2xl">
          <p className="font-medium mb-2">{yaUsado ? "Este enlace ya fue usado." : "Este enlace venció."}</p>
          <p className="text-sm text-muted">Contáctanos por WhatsApp si necesitas ayuda.</p>
        </div>
      )}
    </div>
  );
}
