import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getInventario, getTotalGastosCiclo } from "@/service/inventario.service";
import { getUltimosMovimientos } from "@/service/movimiento-stock.service";
import { getCicloActual } from "@/lib/ciclo-session";
import db from "@/lib/db";
import InventarioClient from "@/components/modules/inventario/InventarioClient";

interface Props {
  cicloParam?: number;
}

export default async function InventarioView({ cicloParam }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const roles = session.user.roles ?? [];
  const isAdmin = roles.includes("ADMIN");

  if (!isAdmin) {
    redirect("/dashboard");
  }

  const idCicloActual = await getCicloActual();
  const idCicloElegido = cicloParam || idCicloActual;

  const cicloActualInfo = await db.cicloLectivo.findUnique({ where: { idCiclo: idCicloElegido } });

  const insumos = await getInventario(idCicloElegido);
  const movimientos = await getUltimosMovimientos(999, idCicloElegido);
  const totalGastos = await getTotalGastosCiclo(idCicloElegido);

  const ciclos = await db.cicloLectivo.findMany({
    orderBy: { anio: "desc" },
  });

  return (
    <InventarioClient
      insumos={insumos}
      movimientos={movimientos}
      cicloActual={cicloActualInfo}
      totalGastos={totalGastos}
      ciclos={ciclos}
      idCicloActual={idCicloElegido}
    />
  );
}
