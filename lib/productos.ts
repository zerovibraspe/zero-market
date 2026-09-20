export const CATEGORIA_LABEL: Record<string, string> = {
  pdf: "PDF",
  video: "Video",
  plugin: "Plugin",
  otro: "Otro",
};

export function formatearPrecio(precio: string) {
  return `S/ ${Number(precio).toFixed(2)}`;
}

export function linkWhatsapp(numero: string, nombreProducto: string) {
  const mensaje = `Hola, quiero comprar "${nombreProducto}"`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
