"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIAS_SUGERIDAS } from "@/lib/productos";
import { subirArchivoMaestro, validarTamanoTotal } from "@/lib/subida-cliente";

export function FormularioProducto({ categoriasExistentes }: { categoriasExistentes: string[] }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const categorias = [...new Set([...CATEGORIAS_SUGERIDAS, ...categoriasExistentes])];

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const formData = new FormData(e.currentTarget);
    formData.set("requiereWatermark", formData.get("requiereWatermark") === "on" ? "true" : "false");

    const archivosParaGithub = [
      ...formData.getAll("fotos").filter((f): f is File => f instanceof File && f.size > 0),
      ...formData.getAll("videoArchivo").filter((f): f is File => f instanceof File && f.size > 0),
    ];
    const errorTamano = validarTamanoTotal(archivosParaGithub);
    if (errorTamano) {
      setCargando(false);
      setError(errorTamano);
      return;
    }

    const archivoMaestro = formData.get("archivoMaestro");
    formData.delete("archivoMaestro");

    try {
      if (!(archivoMaestro instanceof File) || archivoMaestro.size === 0) {
        throw new Error("Falta el archivo maestro");
      }
      formData.set("archivoMaestroKey", await subirArchivoMaestro(archivoMaestro));
    } catch {
      setCargando(false);
      setError("No se pudo subir el archivo maestro. Intenta de nuevo.");
      return;
    }

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

      <Campo label="WhatsApp de venta (opcional)">
        <input name="whatsappNumero" type="tel" placeholder="51999999999" className="input" />
        <span className="text-xs text-muted">
          Formato internacional sin +. Si lo dejas vacío, usa el número general de la tienda.
        </span>
      </Campo>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="Categoría">
          <input name="categoria" list="categorias-existentes" required placeholder="pdf, video, curso..." className="input" />
          <datalist id="categorias-existentes">
            {categorias.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <span className="text-xs text-muted">Elige una existente o escribe una nueva.</span>
        </Campo>
        <Campo label="Precio (S/)">
          <input name="precio" type="number" step="0.01" min="0" required className="input" />
        </Campo>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input name="requiereWatermark" type="checkbox" defaultChecked className="h-4 w-4" />
        <span className="font-medium text-muted">Aplicar marca de agua (solo tiene efecto en archivos PDF)</span>
      </label>

      <Campo label="Fotos (opcional, puedes elegir varias)">
        <input name="fotos" type="file" accept="image/*" multiple className="input" />
        <span className="text-xs text-muted">
          Tardan ~1 minuto en verse reflejadas en la página mientras Vercel vuelve a desplegar.
        </span>
      </Campo>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">Video de muestra (opcional)</span>
        <input name="videoYoutube" type="url" placeholder="Link de YouTube" className="input" />
        <input name="videoArchivo" type="file" accept="video/*" className="input" />
        <span className="text-xs text-muted">
          Pega un link de YouTube (recomendado para videos pesados) o sube un archivo — si mandas ambos, se usa el archivo.
        </span>
      </div>

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
