import db from "@/lib/db";

export async function getUltimosMovimientos(limit = 20) {
  return db.movimientoStock.findMany({
    orderBy: { fecha: "desc" },
    take: limit,
    include: {
      insumo: { select: { nombre: true, unidadMedida: true } },
      usuario: { select: { persona: { select: { nombre: true, apellido: true } } } },
      gastos: {
        select: { monto: true, concepto: true, categoria: true },
      },
    },
  });
}
