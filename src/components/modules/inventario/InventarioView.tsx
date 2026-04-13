import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getInventario, getTotalGastosInventario } from "@/service/inventario.service";
import { getUltimosMovimientos } from "@/service/movimiento-stock.service";
import InventarioClient from "@/components/modules/inventario/InventarioClient";

export default async function InventarioView() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const roles = session.user.roles ?? [];
  const isAdmin = roles.includes("ADMIN");

  if (!isAdmin) {
    redirect("/dashboard");
  }

  const insumos = await getInventario();
  const movimientos = await getUltimosMovimientos(999);
  const totalGastos = await getTotalGastosInventario();

  return (
    <InventarioClient
      insumos={insumos}
      movimientos={movimientos}
      totalGastos={totalGastos}
    />
  );
}
