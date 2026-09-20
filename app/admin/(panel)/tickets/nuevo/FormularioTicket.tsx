"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { linkWhatsappEntrega } from "@/lib/productos";
import type { Vencimiento } from "@/lib/tickets";

type Producto = { id: string; nombre: string; requiereWatermark: boolean };

const ESQUINAS = [
  { valor: "tl", label: "Sup. izquierda" },
  { valor: "tr", label: "Sup. derecha" },
  { valor: "bl", label: "Inf. izquierda" },
  { valor: "br", label: "Inf. derecha" },
] as const;

type TicketGenerado = {
  url: string;
  nombreComprador: string;
  celularComprador: string;
  nombreProducto: string;
  vencimiento: Vencimiento;
};

export function FormularioTicket({ productos }: { productos: Producto[] }) {
  const router = useRouter();
  const [productoId, setProductoId] = useState(productos[0]?.id ?? "");
  const [esquina, setEsquina] = useState<"tl" | "tr" | "bl" | "br">("br");
  const [vencimiento, setVencimiento] = useState<Vencimiento>("24h");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [ticketGenerado, setTicketGenerado] = useState<TicketGenerado | null>(null);
  const [copiado, setCopiado] = useState(false);

  const producto = useMemo(() => productos.find((p) => p.id === productoId), [productos, productoId]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    setTicketGenerado(null);

    const formData = new FormData(e.currentTarget);
    const nombreComprador = String(formData.get("nombreComprador") ?? "");
    const celularComprador = String(formData.get("celularComprador") ?? "");

    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productoId,
        nombreComprador,
        celularComprador,
        posicionMarcaAgua: producto?.requiereWatermark ? esquina : null,
        vencimiento,
      }),
    });

    setCargando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo generar el ticket");
      return;
    }

    const data = await res.json();
    const url = `${window.location.origin}${data.urlDescarga}`;
    setTicketGenerado({
      url,
      nombreComprador,
      celularComprador,
      nombreProducto: producto?.nombre ?? "",
      vencimiento,
    });
    await navigator.clipboard.writeText(url).then(
      () => setCopiado(true),
      () => setCopiado(false),
    );
    router.refresh();
  }

  if (productos.length === 0) {
    return <p className="text-muted">Primero sube un producto en la sección Productos.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="bg-surface border border-border rounded-2xl p-5 sm:p-8 flex flex-col gap-5 max-w-[560px]">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-muted">Producto</span>
        <select value={productoId} onChange={(e) => setProductoId(e.target.value)} className="input">
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-muted">Nombre del comprador</span>
        <input name="nombreComprador" required className="input" />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-muted">Celular</span>
        <input name="celularComprador" type="tel" required className="input" />
      </label>

      {producto?.requiereWatermark && (
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-muted">Posición de la marca de agua</span>
          <div className="grid grid-cols-2 gap-2 w-40">
            {ESQUINAS.map((op) => (
              <button
                key={op.valor}
                type="button"
                onClick={() => setEsquina(op.valor)}
                className={`aspect-square rounded-xl border text-xs font-medium ${
                  esquina === op.valor ? "border-accent-dark bg-accent-tint text-accent-dark" : "border-border text-muted"
                }`}
                title={op.label}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-muted">Vencimiento del link</span>
        <select value={vencimiento} onChange={(e) => setVencimiento(e.target.value as Vencimiento)} className="input">
          <option value="24h">24 horas</option>
          <option value="48h">48 horas</option>
          <option value="primer_uso">Al primer uso</option>
        </select>
      </label>

      {error && <p className="text-sm text-error-fg bg-error-bg rounded-lg px-3 py-2">{error}</p>}

      {ticketGenerado && (
        <div className="flex flex-col gap-3 bg-success-bg text-success-fg rounded-lg px-3 py-3">
          <p className="text-sm break-all">
            {copiado ? "Link copiado: " : "Link generado: "}
            {ticketGenerado.url}
          </p>
          <a
            href={linkWhatsappEntrega(ticketGenerado)}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start px-4 py-2 rounded-full bg-ink text-white text-sm font-semibold"
          >
            Enviar link por WhatsApp
          </a>
        </div>
      )}

      <button type="submit" disabled={cargando} className="mt-2 py-2.5 rounded-full bg-accent text-ink font-semibold disabled:opacity-60">
        {cargando ? "Generando..." : "Generar ticket y copiar link"}
      </button>
    </form>
  );
}
