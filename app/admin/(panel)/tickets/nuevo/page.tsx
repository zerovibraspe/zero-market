import { db } from "@/lib/db";
import { productos } from "@/db/schema";
import { FormularioTicket } from "./FormularioTicket";

export const dynamic = "force-dynamic";

export default async function NuevoTicketPage() {
  const lista = await db
    .select({ id: productos.id, nombre: productos.nombre, requiereWatermark: productos.requiereWatermark })
    .from(productos);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-8">Generar ticket</h1>
      <FormularioTicket productos={lista} />
    </div>
  );
}
