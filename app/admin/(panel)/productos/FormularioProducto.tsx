"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function FormularioProducto() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [categoria, setCategoria] = useState("pdf");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const formData = new FormData(e.currentTarget);
    formData.set("requiereWatermark", categoria === "pdf" ? "true" : "false");

    const res = await fetch("/api/productos", { method: "POST", body: formData });
    setCargando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo crear el producto");
      return;
    }

    setAbierto(false);
    router.refresh();
  }

  if (!abierto) {
    return (
      <button onClick={() => setAbierto(true)} className="px-5 py-2.5 rounded-full bg-accent text-ink text-sm font-semibold">
        + Nuevo producto
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-surface border border-border rounded-2xl p-6 mb-8 flex flex-col gap-4 max-w-xl">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold">Nuevo producto</h2>
        <button type="button" onClick={() => setAbierto(false)} className="text-muted text-sm">
          Cancelar
        </button>
      </div>

      <Campo label="Nombre">
        <input name="nombre" required className="input" />
      </Campo>

      <Campo label="Descripción">
        <textarea name="descripcion" rows={2} className="input" />
      </Campo>

      <Campo label="Autor / creador">
        <input name="autorNombre" placeholder="Se imprime en la marca de agua" className="input" />
      </Campo>

      <div className="grid grid-cols-2 gap-4">
        <Campo label="Categoría">
          <select name="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} className="input">
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
            <option value="plugin">Plugin</option>
            <option value="otro">Otro</option>
          </select>
        </Campo>
        <Campo label="Precio (S/)">
          <input name="precio" type="number" step="0.01" min="0" required className="input" />
        </Campo>
      </div>

      <Campo label="Fotos">
        <input
          name="fotos"
          placeholder="/productos/mi-producto/1.jpg, /productos/mi-producto/2.jpg"
          className="input"
        />
        <span className="text-xs text-muted">
          Rutas separadas por coma. Sube las imágenes a <code>public/productos/</code> en el repo de GitHub antes de
          crear el producto — no se suben a B2.
        </span>
      </Campo>

      <Campo label="Archivo maestro">
        <input name="archivoMaestro" type="file" required className="input" />
      </Campo>

      {error && <p className="text-sm text-error-fg bg-error-bg rounded-lg px-3 py-2">{error}</p>}

      <button type="submit" disabled={cargando} className="mt-2 py-2.5 rounded-full bg-accent text-ink font-semibold disabled:opacity-60">
        {cargando ? "Subiendo..." : "Crear producto"}
      </button>
    </form>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
