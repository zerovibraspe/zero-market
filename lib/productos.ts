import type { Vencimiento } from "./tickets";

// Las categorías son texto libre (el vendedor puede crear las que quiera desde el CMS).
// Estas son solo sugerencias con mayúsculas "bonitas"; cualquier otra se capitaliza tal cual.
const ETIQUETAS_CONOCIDAS: Record<string, string> = {
  pdf: "PDF",
  video: "Video",
  plugin: "Plugin",
  otro: "Otro",
};

export function categoriaLabel(categoria: string): string {
  const conocida = ETIQUETAS_CONOCIDAS[categoria.toLowerCase()];
  if (conocida) return conocida;
  return categoria.charAt(0).toUpperCase() + categoria.slice(1);
}

export const CATEGORIAS_SUGERIDAS = ["pdf", "video", "plugin"];

export function formatearPrecio(precio: string) {
  return `S/ ${Number(precio).toFixed(2)}`;
}

export function linkWhatsapp(numero: string, nombreProducto: string) {
  const mensaje = `Hola, quiero comprar "${nombreProducto}"`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

function textoVencimiento(vencimiento: Vencimiento): string {
  if (vencimiento === "primer_uso") return "Este link se invalida apenas lo uses, así que descárgalo cuando estés listo para hacerlo.";
  const horas = vencimiento === "24h" ? "24 horas" : "48 horas";
  return `Este link vence en ${horas}, así que descárgalo antes de que pase ese tiempo.`;
}

// Mensaje al COMPRADOR (celular del ticket, no el número de ventas de la tienda) con su link de descarga.
export function linkWhatsappEntrega(params: {
  celularComprador: string;
  nombreComprador: string;
  nombreProducto: string;
  url: string;
  vencimiento: Vencimiento;
}) {
  const { celularComprador, nombreComprador, nombreProducto, url, vencimiento } = params;
  const numero = celularComprador.replace(/\D/g, "");
  const mensaje = [
    `Hola ${nombreComprador}, gracias por tu compra de "${nombreProducto}".`,
    "",
    `Tu link de descarga personal: ${url}`,
    "",
    textoVencimiento(vencimiento),
    "El link es de un solo uso: se invalida apenas descargues el archivo.",
  ].join("\n");
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
