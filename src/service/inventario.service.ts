import db from "@/lib/db";

export async function getInventario() {
  return db.inventario.findMany({
    orderBy: { nombre: "asc" },
  });
}

export async function getTotalGastosInventario() {
  const movimientos = await db.movimientoStock.findMany({
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
