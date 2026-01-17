import db from "@/lib/db";

export async function getInventario() {
  return db.inventario.findMany({
    orderBy: { nombre: "asc" },
  });
}
