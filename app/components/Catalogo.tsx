"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IconoCategoria } from "./IconoCategoria";
import { categoriaLabel, formatearPrecio, linkWhatsapp } from "@/lib/productos";

type Producto = {
  id: string;
  nombre: string;
  categoria: string;
  precio: string;
  portadaUrl: string | null;
  fotos: string[];
  whatsappNumero: string | null;
};

export function Catalogo({ productos, whatsappNumero }: { productos: Producto[]; whatsappNumero: string }) {
  const [filtro, setFiltro] = useState<string>("todos");

  const filtros = useMemo(() => ["todos", ...new Set(productos.map((p) => p.categoria))], [productos]);
  const visibles = filtro === "todos" ? productos : productos.filter((p) => p.categoria === filtro);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {filtros.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              filtro === f
                ? "bg-ink text-white border-ink"
                : "bg-surface text-muted border-border hover:border-ink/30"
            }`}
          >
            {f === "todos" ? "Todos" : categoriaLabel(f)}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <p className="text-muted mb-4">No hay recursos en esta categoría todavía.</p>
          <button onClick={() => setFiltro("todos")} className="text-accent-dark font-semibold underline">
            Ver todo el catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibles.map((producto) => (
            <div key={producto.id} className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col">
              <Link href={`/productos/${producto.id}`} className="h-[228px] bg-surface-alt flex items-center justify-center overflow-hidden">
                {producto.fotos[0] || producto.portadaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={producto.fotos[0] ?? producto.portadaUrl!} alt={producto.nombre} className="w-full h-full object-cover" />
                ) : (
                  <IconoCategoria categoria={producto.categoria} className="w-10 h-10 text-accent-dark" />
                )}
              </Link>
              <div className="p-5 flex flex-col gap-3 flex-1">
                <span className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-tint text-accent-dark">
                  <IconoCategoria categoria={producto.categoria} className="w-3.5 h-3.5" />
                  {categoriaLabel(producto.categoria)}
                </span>
                <Link href={`/productos/${producto.id}`} className="font-display font-semibold text-lg leading-snug hover:underline">
                  {producto.nombre}
                </Link>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="font-display font-bold text-lg">{formatearPrecio(producto.precio)}</span>
                  <a
                    href={linkWhatsapp(producto.whatsappNumero || whatsappNumero, producto.nombre)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full bg-accent text-ink text-sm font-semibold hover:brightness-95 transition"
                  >
                    Comprar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
