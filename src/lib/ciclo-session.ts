import { cookies } from "next/headers";
import db from "@/lib/db";

export async function getCicloActual() {
  const cookieStore = await cookies();
  const cicloCookie = cookieStore.get("cicloSeleccionado");

  // Ensure cookie has a non-empty value before using it
  if (cicloCookie && cicloCookie.value) {
    const cicloId = Number(cicloCookie.value);
    // Ensure it's a valid number and not 0 from an empty string etc.
    if (!isNaN(cicloId) && cicloId > 0) {
      return cicloId;
    }
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