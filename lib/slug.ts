export function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

// Extrae "mi-producto-ab12cd" de una ruta "/productos/mi-producto-ab12cd/1.jpg", para reusar
// la misma carpeta de GitHub al editar un producto en vez de crear una nueva por cada edición.
export function carpetaDesdeRuta(ruta: string): string | null {
  const match = ruta.match(/^\/productos\/([^/]+)\//);
  return match ? match[1] : null;
}
