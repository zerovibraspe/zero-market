import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { productos } from "@/db/schema";
import { categoriaLabel, formatearPrecio } from "@/lib/productos";
import { FormularioProducto } from "./FormularioProducto";

export const dynamic = "force-dynamic";

export default async function AdminProductosPage() {
  const lista = await db.select().from(productos).orderBy(desc(productos.creadoEn));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-2xl">Productos</h1>
        <FormularioProducto categoriasExistentes={[...new Set(lista.map((p) => p.categoria))]} />
      </div>

      {lista.length === 0 ? (
        <p className="text-muted">Aún no subiste ningún producto.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lista.map((p) => (
            <div key={p.id} className="bg-surface border border-border rounded-2xl p-5">
              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-tint text-accent-dark mb-3">
                {categoriaLabel(p.categoria)}
              </span>
              <h3 className="font-display font-semibold mb-1">{p.nombre}</h3>
              <p className="text-sm text-muted mb-3">{formatearPrecio(p.precio)}</p>
              <p className="text-xs text-muted mb-2">
                {p.activo ? "Visible en catálogo" : "Oculto"} · {p.fotos.length} foto{p.fotos.length === 1 ? "" : "s"}
              </p>
              <Link href={`/productos/${p.id}`} target="_blank" className="text-xs text-accent-dark font-semibold underline">
                Ver página →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
