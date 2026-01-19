import { cookies } from "next/headers";
import db from "@/lib/db";

export async function getCicloActual() {
  const cookieStore = await cookies();
  const cicloCookie = cookieStore.get("cicloSeleccionado");

  if (cicloCookie) {
    return Number(cicloCookie.value);
  }

  // Si no hay cookie, buscamos el ciclo activo por defecto (estado: true)
  const cicloActivo = await db.cicloLectivo.findFirst({
    where: { estado: true }
  });

  // Si no hay activo, devolvemos el último creado o 1 como fallback
  if (!cicloActivo) {
    const ultimo = await db.cicloLectivo.findFirst({
      orderBy: { anio: 'desc' }
    });
    return ultimo?.idCiclo ?? 1;
  }

  return cicloActivo.idCiclo;
}