export default function ProductoNoEncontrado() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
      <h1 className="font-display font-bold text-2xl mb-2">Producto no encontrado</h1>
      <p className="text-muted max-w-xs">Este producto no existe o ya no está disponible.</p>
      <a href="/#catalogo" className="mt-4 text-accent-dark font-semibold underline">
        Volver al catálogo
      </a>
    </div>
  );
}
