import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tickets, productos } from "@/db/schema";
import { BadgeEstado } from "@/app/components/BadgeEstado";

export const dynamic = "force-dynamic";

function estadoEfectivo(ticket: { estado: string; fechaExpiracion: Date | null }) {
  if (ticket.estado === "pendiente" && ticket.fechaExpiracion && ticket.fechaExpiracion.getTime() < Date.now()) {
    return "expirado";
  }
  return ticket.estado;
}

export default async function AdminTicketsPage() {
  const lista = await db
    .select({
      id: tickets.id,
      codigoLicencia: tickets.codigoLicencia,
      nombreComprador: tickets.nombreComprador,
      estado: tickets.estado,
      fechaExpiracion: tickets.fechaExpiracion,
      fechaCreacion: tickets.fechaCreacion,
      productoNombre: productos.nombre,
    })
    .from(tickets)
    .innerJoin(productos, eq(tickets.productoId, productos.id))
    .orderBy(desc(tickets.fechaCreacion));

  const conEstado = lista.map((t) => ({ ...t, estadoEfectivo: estadoEfectivo(t) }));
  const generados = conEstado.length;
  const descargados = conEstado.filter((t) => t.estadoEfectivo === "descargado").length;
  const pendientes = conEstado.filter((t) => t.estadoEfectivo === "pendiente").length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <h1 className="font-display font-bold text-2xl">Tickets</h1>
        <Link
          href="/admin/tickets/nuevo"
          className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-accent text-ink text-sm font-semibold"
        >
          + Generar ticket
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Tickets generados", valor: generados },
          { label: "Descargados", valor: descargados },
          { label: "Pendientes", valor: pendientes },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface border border-border rounded-2xl p-5">
            <p className="text-sm text-muted mb-1">{stat.label}</p>
            <p className="font-display font-bold text-3xl">{stat.valor}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th className="px-5 py-3 font-medium">Comprador</th>
              <th className="px-5 py-3 font-medium">Producto</th>
              <th className="px-5 py-3 font-medium">Código</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {conEstado.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted">
                  Aún no generaste ningún ticket.
                </td>
              </tr>
            ) : (
              conEstado.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">{t.nombreComprador}</td>
                  <td className="px-5 py-3">{t.productoNombre}</td>
                  <td className="px-5 py-3 font-mono text-xs">{t.codigoLicencia}</td>
                  <td className="px-5 py-3">
                    <BadgeEstado estado={t.estadoEfectivo} />
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {new Date(t.fechaCreacion).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
