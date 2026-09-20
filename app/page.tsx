import { db } from "@/lib/db";
import { productos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Catalogo } from "./components/Catalogo";
import { IconoCategoria } from "./components/IconoCategoria";

export const dynamic = "force-dynamic";

const NOMBRE_TIENDA = "Zero Market";
const WHATSAPP_NUMERO = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "51999999999";

export default async function Home() {
  const lista = await db.select().from(productos).where(eq(productos.activo, true));

  // Tarjetas decorativas del hero: productos reales (con su foto si tienen), no íconos fijos.
  // Cambian solas a medida que subes productos/fotos nuevas desde el CMS.
  const destacados = [...lista].sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime()).slice(0, 3);

  return (
    <div className="flex flex-col flex-1">
      <header className="sticky top-4 z-10 mx-4 sm:mx-8">
        <nav className="max-w-5xl mx-auto flex items-center justify-between bg-surface border border-border rounded-full h-16 px-6 shadow-sm">
          <span className="font-display font-bold text-lg">{NOMBRE_TIENDA}</span>
          <div className="hidden sm:flex items-center gap-6 text-sm text-muted">
            <a href="#catalogo" className="hover:text-ink">Catálogo</a>
            <a href="#como-funciona" className="hover:text-ink">Cómo funciona</a>
          </div>
          <a href="#catalogo" className="px-5 py-2.5 rounded-full bg-accent text-ink text-sm font-semibold">
            Ver catálogo
          </a>
        </nav>
      </header>

      <section className="max-w-5xl mx-auto w-full px-6 sm:px-8 pt-20 pb-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl leading-tight mb-4">
            Recursos digitales listos para descargar
          </h1>
          <p className="text-muted text-lg mb-6 max-w-md">
            PDFs, video-tutoriales y plugins, entregados con tu link personal por WhatsApp.
          </p>
          <div className="flex items-center gap-4">
            <a href="#catalogo" className="px-6 py-3 rounded-full bg-accent text-ink font-semibold">
              Ver catálogo
            </a>
            <span className="text-sm text-muted">+{lista.length} recursos digitales</span>
          </div>
        </div>
        <div className="relative h-64 hidden md:block">
          {destacados.length === 0
            ? ["pdf", "video", "plugin"].map((cat, i) => (
                <div
                  key={cat}
                  className="absolute w-40 h-52 bg-surface border border-border rounded-2xl shadow-md flex flex-col items-center justify-center gap-3"
                  style={{ left: `${i * 70}px`, top: `${i * 20}px`, transform: `rotate(${(i - 1) * 6}deg)`, zIndex: i }}
                >
                  <IconoCategoria categoria={cat} className="w-8 h-8 text-accent-dark" />
                  <span className="text-xs font-semibold uppercase text-muted">{cat}</span>
                </div>
              ))
            : destacados.map((producto, i) => (
                <div
                  key={producto.id}
                  className="absolute w-40 h-52 bg-surface border border-border rounded-2xl shadow-md overflow-hidden flex flex-col items-center justify-center gap-3"
                  style={{ left: `${i * 70}px`, top: `${i * 20}px`, transform: `rotate(${(i - 1) * 6}deg)`, zIndex: i }}
                >
                  {producto.fotos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={producto.fotos[0]} alt={producto.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <IconoCategoria categoria={producto.categoria} className="w-8 h-8 text-accent-dark" />
                      <span className="text-xs font-semibold uppercase text-muted px-2 text-center">{producto.categoria}</span>
                    </>
                  )}
                </div>
              ))}
        </div>
      </section>

      <section id="como-funciona" className="max-w-5xl mx-auto w-full px-6 sm:px-8 py-16">
        <h2 className="font-display font-bold text-2xl mb-8 text-center">Cómo funciona</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { titulo: "Escribe por WhatsApp", texto: "Elige el recurso y contáctanos con un clic." },
            { titulo: "Paga por Yape o Plin", texto: "Confirmamos tu pago directo en el chat." },
            { titulo: "Recibe tu link personal", texto: "Descarga tu recurso con tu código de licencia." },
          ].map((paso) => (
            <div key={paso.titulo} className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-2">{paso.titulo}</h3>
              <p className="text-sm text-muted">{paso.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="catalogo" className="bg-surface-alt py-16">
        <div className="max-w-5xl mx-auto w-full px-6 sm:px-8">
          <h2 className="font-display font-bold text-2xl mb-8">Catálogo</h2>
          <Catalogo productos={lista} whatsappNumero={WHATSAPP_NUMERO} />
        </div>
      </section>

      <section className="bg-accent">
        <div className="max-w-5xl mx-auto w-full px-6 sm:px-8 py-14 flex flex-col sm:flex-row items-center justify-between gap-6">
          <h2 className="font-display font-bold text-2xl text-ink text-center sm:text-left">
            ¿Buscas un recurso específico? Escríbenos.
          </h2>
          <a
            href={`https://wa.me/${WHATSAPP_NUMERO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full bg-ink text-white font-semibold whitespace-nowrap"
          >
            Escribir por WhatsApp
          </a>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-muted">
        © {new Date().getFullYear()} {NOMBRE_TIENDA}
      </footer>
    </div>
  );
}
