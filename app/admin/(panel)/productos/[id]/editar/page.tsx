import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { productos } from "@/db/schema";
import { FormularioEditarProducto } from "./FormularioEditarProducto";

export const dynamic = "force-dynamic";

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [producto] = await db.select().from(productos).where(eq(productos.id, id));
  if (!producto) notFound();

  const todos = await db.select({ categoria: productos.categoria }).from(productos);
  const categoriasExistentes = [...new Set(todos.map((p) => p.categoria))];

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-8">Editar producto</h1>
      <FormularioEditarProducto producto={producto} categoriasExistentes={categoriasExistentes} />
    </div>
  );
}
