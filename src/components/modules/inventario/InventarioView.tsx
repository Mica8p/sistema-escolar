import { auth } from "@/auth";
import { getInventario } from "@/service/inventario.service";
import { getUltimosMovimientos } from "@/service/movimiento-stock.service";
import InventarioClient from "@/components/modules/inventario/InventarioClient";

export default async function InventarioView() {
  const session = await auth();
  const roles = session?.user?.roles ?? [];
  const isAdmin = roles.includes("ADMIN");
  const isDocente = roles.includes("DOCENTE");

  const insumos = await getInventario();
  const movimientos = await getUltimosMovimientos(20);

  return (
    <InventarioClient
      insumos={insumos}
      isAdmin={isAdmin}
      isDocente={isDocente}
      movimientos={movimientos}
    />
  );
}
