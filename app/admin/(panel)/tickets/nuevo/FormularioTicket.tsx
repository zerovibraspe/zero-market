"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Producto = { id: string; nombre: string; requiereWatermark: boolean };

const ESQUINAS = [
  { valor: "tl", label: "Sup. izquierda" },
  { valor: "tr", label: "Sup. derecha" },
  { valor: "bl", label: "Inf. izquierda" },
  { valor: "br", label: "Inf. derecha" },
] as const;

export function FormularioTicket({ productos }: { productos: Producto[] }) {
  const router = useRouter();
  const [productoId, setProductoId] = useState(productos[0]?.id ?? "");
  const [esquina, setEsquina] = useState<"tl" | "tr" | "bl" | "br">("br");
  const [vencimiento, setVencimiento] = useState<"24h" | "48h" | "primer_uso">("24h");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [linkGenerado, setLinkGenerado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const producto = useMemo(() => productos.find((p) => p.id === productoId), [productos, productoId]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    setLinkGenerado(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      productoId,
      nombreComprador: String(formData.get("nombreComprador") ?? ""),
      celularComprador: String(formData.get("celularComprador") ?? ""),
      posicionMarcaAgua: producto?.requiereWatermark ? esquina : null,
      vencimiento,
    };

    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setCargando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo generar el ticket");
      return;
    }

    const data = await res.json();
    const url = `${window.location.origin}${data.urlDescarga}`;
    setLinkGenerado(url);
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
    <form onSubmit={onSubmit} className="bg-surface border border-border rounded-2xl p-8 flex flex-col gap-5 max-w-[560px]">
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
        <select value={vencimiento} onChange={(e) => setVencimiento(e.target.value as typeof vencimiento)} className="input">
          <option value="24h">24 horas</option>
          <option value="48h">48 horas</option>
          <option value="primer_uso">Al primer uso</option>
        </select>
      </label>

      {error && <p className="text-sm text-error-fg bg-error-bg rounded-lg px-3 py-2">{error}</p>}

      {linkGenerado && (
        <div className="text-sm bg-success-bg text-success-fg rounded-lg px-3 py-2 break-all">
          {copiado ? "Link copiado: " : "Link generado: "}
          {linkGenerado}
        </div>
      )}

      <button type="submit" disabled={cargando} className="mt-2 py-2.5 rounded-full bg-accent text-ink font-semibold disabled:opacity-60">
        {cargando ? "Generando..." : "Generar ticket y copiar link"}
      </button>
    </form>
  );
}
