const ESTILOS: Record<string, string> = {
  pendiente: "bg-pending-bg text-pending-fg",
  descargado: "bg-success-bg text-success-fg",
  expirado: "bg-error-bg text-error-fg",
};

const LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  descargado: "Descargado",
  expirado: "Expirado",
};

export function BadgeEstado({ estado }: { estado: string }) {
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${ESTILOS[estado] ?? ESTILOS.pendiente}`}>
      {LABEL[estado] ?? estado}
    </span>
  );
}
