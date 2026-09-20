import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { productos } from "@/db/schema";
import { categoriaLabel, formatearPrecio, linkWhatsapp } from "@/lib/productos";
import { IconoCategoria } from "@/app/components/IconoCategoria";

export const dynamic = "force-dynamic";

const WHATSAPP_NUMERO = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "51999999999";

export default async function ProductoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [producto] = await db.select().from(productos).where(eq(productos.id, id));
  if (!producto || !producto.activo) notFound();

  const fotos = producto.fotos.length > 0 ? producto.fotos : producto.portadaUrl ? [producto.portadaUrl] : [];

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-6 sm:px-8 py-12">
      <a href="/#catalogo" className="text-sm text-muted hover:text-ink">
        ← Volver al catálogo
      </a>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
        <div>
          <div className="aspect-square bg-surface-alt rounded-2xl overflow-hidden flex items-center justify-center mb-3">
            {fotos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotos[0]} alt={producto.nombre} className="w-full h-full object-cover" />
            ) : (
              <IconoCategoria categoria={producto.categoria} className="w-16 h-16 text-accent-dark" />
            )}
          </div>
          {fotos.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {fotos.slice(1).map((foto) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={foto} src={foto} alt="" className="aspect-square object-cover rounded-xl border border-border" />
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-tint text-accent-dark mb-3">
            <IconoCategoria categoria={producto.categoria} className="w-3.5 h-3.5" />
            {categoriaLabel(producto.categoria)}
          </span>
          <h1 className="font-display font-bold text-3xl mb-2">{producto.nombre}</h1>
          {producto.autorNombre && <p className="text-sm text-muted mb-4">Por {producto.autorNombre}</p>}
          {producto.descripcion && <p className="text-muted mb-6 whitespace-pre-line">{producto.descripcion}</p>}

          <div className="flex items-center justify-between border-t border-border pt-6">
            <span className="font-display font-bold text-2xl">{formatearPrecio(producto.precio)}</span>
            <a
              href={linkWhatsapp(WHATSAPP_NUMERO, producto.nombre)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-accent text-ink font-semibold"
            >
              Comprar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
