"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIAS_SUGERIDAS } from "@/lib/productos";
import { esVideoYoutube } from "@/lib/video";
import { subirArchivoMaestro, validarTamanoTotal } from "@/lib/subida-cliente";

type Producto = {
  id: string;
  nombre: string;
  descripcion: string | null;
  autorNombre: string | null;
  categoria: string;
  precio: string;
  requiereWatermark: boolean;
  activo: boolean;
  fotos: string[];
  videoMuestraUrl: string | null;
  archivoMaestroUrl: string;
};

export function FormularioEditarProducto({
  producto,
  categoriasExistentes,
}: {
  producto: Producto;
  categoriasExistentes: string[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [fotosConservadas, setFotosConservadas] = useState(producto.fotos);
  const [quitarVideo, setQuitarVideo] = useState(false);

  const categorias = [...new Set([...CATEGORIAS_SUGERIDAS, ...categoriasExistentes])];
  const videoEsYoutube = producto.videoMuestraUrl ? esVideoYoutube(producto.videoMuestraUrl) : false;
  const nombreArchivoMaestro = producto.archivoMaestroUrl.split("/").pop();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const formData = new FormData(e.currentTarget);
    formData.set("requiereWatermark", formData.get("requiereWatermark") === "on" ? "true" : "false");
    formData.set("activo", formData.get("activo") === "on" ? "true" : "false");
    formData.set("quitarVideo", quitarVideo ? "true" : "false");
    fotosConservadas.forEach((ruta) => formData.append("fotosConservadas", ruta));

    const archivosParaGithub = [
      ...formData.getAll("fotosNuevas").filter((f): f is File => f instanceof File && f.size > 0),
      ...formData.getAll("videoArchivo").filter((f): f is File => f instanceof File && f.size > 0),
    ];
    const errorTamano = validarTamanoTotal(archivosParaGithub);
    if (errorTamano) {
      setCargando(false);
      setError(errorTamano);
      return;
    }

    const nuevoArchivoMaestro = formData.get("archivoMaestro");
    formData.delete("archivoMaestro");

    if (nuevoArchivoMaestro instanceof File && nuevoArchivoMaestro.size > 0) {
      try {
        formData.set("archivoMaestroKey", await subirArchivoMaestro(nuevoArchivoMaestro));
      } catch {
        setCargando(false);
        setError("No se pudo subir el nuevo archivo maestro. Intenta de nuevo.");
        return;
      }
    }

    const res = await fetch(`/api/productos/${producto.id}`, { method: "PATCH", body: formData });
    setCargando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar el producto");
      return;
    }

    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 max-w-xl">
      <Campo label="Nombre">
        <input name="nombre" defaultValue={producto.nombre} required className="input" />
      </Campo>

      <Campo label="Descripción">
        <textarea name="descripcion" defaultValue={producto.descripcion ?? ""} rows={3} className="input" />
      </Campo>

      <Campo label="Autor / creador">
        <input name="autorNombre" defaultValue={producto.autorNombre ?? ""} placeholder="Se imprime en la marca de agua" className="input" />
      </Campo>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="Categoría">
          <input name="categoria" list="categorias-existentes" defaultValue={producto.categoria} required className="input" />
          <datalist id="categorias-existentes">
            {categorias.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Campo>
        <Campo label="Precio (S/)">
          <input name="precio" type="number" step="0.01" min="0" defaultValue={producto.precio} required className="input" />
        </Campo>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input name="requiereWatermark" type="checkbox" defaultChecked={producto.requiereWatermark} className="h-4 w-4" />
          <span className="font-medium text-muted">Aplicar marca de agua (solo tiene efecto en archivos PDF)</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="activo" type="checkbox" defaultChecked={producto.activo} className="h-4 w-4" />
          <span className="font-medium text-muted">Visible en el catálogo</span>
        </label>
      </div>

      <Campo label="Archivo maestro">
        <p className="text-xs text-muted mb-1">Actual: {nombreArchivoMaestro}</p>
        <input name="archivoMaestro" type="file" className="input" />
        <span className="text-xs text-muted">Deja vacío para mantener el archivo actual.</span>
      </Campo>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">Fotos</span>
        {fotosConservadas.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {fotosConservadas.map((foto) => (
              <div key={foto} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foto} alt="" className="aspect-square object-cover rounded-lg border border-border" />
                <button
                  type="button"
                  onClick={() => setFotosConservadas((prev) => prev.filter((f) => f !== foto))}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-ink text-white text-xs leading-5"
                  title="Quitar foto"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <input name="fotosNuevas" type="file" accept="image/*" multiple className="input" />
        <span className="text-xs text-muted">Las fotos nuevas se agregan a las que dejaste arriba.</span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">Video de muestra</span>
        {producto.videoMuestraUrl && !quitarVideo ? (
          <div className="flex items-center justify-between bg-surface-alt rounded-lg px-3 py-2 text-sm">
            <span className="truncate">{videoEsYoutube ? producto.videoMuestraUrl : "Archivo de video subido"}</span>
            <button type="button" onClick={() => setQuitarVideo(true)} className="text-error-fg font-medium shrink-0 ml-2">
              Quitar
            </button>
          </div>
        ) : null}
        <input name="videoYoutube" type="url" placeholder="Link de YouTube (opcional)" className="input" />
        <input name="videoArchivo" type="file" accept="video/*" className="input" />
        <span className="text-xs text-muted">
          Pega un link de YouTube o sube un archivo — si mandas ambos, se usa el archivo subido.
        </span>
      </div>

      {error && <p className="text-sm text-error-fg bg-error-bg rounded-lg px-3 py-2">{error}</p>}

      <button type="submit" disabled={cargando} className="mt-2 py-2.5 rounded-full bg-accent text-ink font-semibold disabled:opacity-60">
        {cargando ? "Guardando..." : "Guardar cambios"}
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
