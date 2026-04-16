import { AlumnoService } from "@/service/alumno.service";
import AlumnoDetalle from "@/components/modules/alumnos/AlumnoDetalle";
import { notFound } from "next/navigation";
import { getCicloActual } from "@/lib/ciclo-session";

export default async function ExpedientePadrePage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (isNaN(id)) {
    return notFound();
  }

  const cicloId = await getCicloActual();
  const alumno = await AlumnoService.getById(id, cicloId);

  if (!alumno) {
    return notFound();
  }

  // Siempre solo lectura para padres
  return <AlumnoDetalle alumno={alumno} cicloId={cicloId} isReadOnly={true} />;
}