import db from "@/lib/db";

export async function getUltimosMovimientos(limit = 20, idCiclo?: number) {
  const where = idCiclo ? { insumo: { idCiclo } } : {};
  return db.movimientoStock.findMany({
    where,
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
