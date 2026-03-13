import db from "@/lib/db";

export async function getInventario(idCiclo?: number) {
  const where = idCiclo ? { idCiclo } : {};
  return db.inventario.findMany({
    where,
    orderBy: { nombre: "asc" },
  });
}

export async function getInventarioByCiclo(idCiclo: number) {
  return db.inventario.findMany({
    where: { idCiclo },
    include: {
      movimientos: {
        orderBy: { fecha: "desc" },
        include: {
          gastos: {
            select: { monto: true, concepto: true, categoria: true },
          },
        },
      },
    },
    orderBy: { nombre: "asc" },
  });
}

export async function getTotalGastosCiclo(idCiclo: number) {
  const movimientos = await db.movimientoStock.findMany({
    where: { insumo: { idCiclo } },
    include: {
      gastos: {
        select: { monto: true },
      },
    },
  });

  const totalGastos = movimientos.reduce((sum, mov) => {
    const movGastos = mov.gastos.reduce((gastoSum, gasto) => gastoSum + gasto.monto, 0);
    return sum + movGastos;
  }, 0);

  return totalGastos;
}
