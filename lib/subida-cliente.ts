const LIMITE_BODY_VERCEL_BYTES = 4 * 1024 * 1024; // margen bajo los 4.5 MB reales, para dejar espacio a otros campos

// Fotos y video de muestra sí pasan por la función de Vercel (se reenvían a GitHub con el
// token secreto, no se pueden subir directo desde el navegador) — validamos antes de enviar
// para no toparnos con un 413 silencioso.
export function validarTamanoTotal(archivos: File[]): string | null {
  const total = archivos.reduce((suma, archivo) => suma + archivo.size, 0);
  if (total > LIMITE_BODY_VERCEL_BYTES) {
    return `Las fotos/video pesan ${(total / 1024 / 1024).toFixed(1)} MB en total — el máximo es ~4 MB por Vercel. Reduce el tamaño o usa un link de YouTube para el video.`;
  }
  return null;
}

// Sube el archivo maestro directo desde el navegador a B2 (bypass del límite de 4.5 MB
// del body de las funciones serverless de Vercel). Devuelve la key en B2 ya subida.
export async function subirArchivoMaestro(archivo: File): Promise<string> {
  const resPresign = await fetch("/api/productos/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombreArchivo: archivo.name, contentType: archivo.type }),
  });

  if (!resPresign.ok) {
    throw new Error("No se pudo iniciar la subida del archivo maestro");
  }

  const { key, url } = await resPresign.json();

  const resSubida = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": archivo.type || "application/octet-stream" },
    body: archivo,
  });

  if (!resSubida.ok) {
    throw new Error("No se pudo subir el archivo maestro a B2");
  }

  return key;
}
