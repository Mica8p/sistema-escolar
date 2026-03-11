import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getInventario } from "@/service/inventario.service";
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
  // Se traen todos los movimientos para que el filtro por mes funcione correctamente
  // en todo el historial, no solo en un número limitado.
  const movimientos = await getUltimosMovimientos();

  return <InventarioClient insumos={insumos} movimientos={movimientos} />;
}
