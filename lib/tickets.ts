export type Vencimiento = "24h" | "48h" | "primer_uso";

export function calcularFechaExpiracion(vencimiento: Vencimiento): Date | null {
  if (vencimiento === "primer_uso") return null;
  const horas = vencimiento === "24h" ? 24 : 48;
  return new Date(Date.now() + horas * 60 * 60 * 1000);
}

export function ticketVigente(ticket: {
  estado: "pendiente" | "descargado" | "expirado";
  fechaExpiracion: Date | null;
}): boolean {
  if (ticket.estado !== "pendiente") return false;
  if (ticket.fechaExpiracion && ticket.fechaExpiracion.getTime() < Date.now()) return false;
  return true;
}
