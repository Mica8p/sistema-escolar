import { cookies } from "next/headers";
import db from "@/lib/db";

export async function getCicloActual() {
  const cookieStore = await cookies();
  const cicloCookie = cookieStore.get("cicloSeleccionado");

  if (cicloCookie) {
    return Number(cicloCookie.value);
  }

  const cicloActivo = await db.cicloLectivo.findFirst({
    where: { estado: true }
  });

  if (!cicloActivo) {
    const ultimo = await db.cicloLectivo.findFirst({
      orderBy: { anio: 'desc' }
    });
    return ultimo?.idCiclo ?? 1;
  }

  return cicloActivo.idCiclo;
}