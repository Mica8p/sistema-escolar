import { AlumnoService } from "@/service/alumno.service";
import AlumnoDetalle from "@/components/modules/alumnos/AlumnoDetalle";
import { notFound } from "next/navigation";
import { getCicloActual } from "@/lib/ciclo-session";

export default async function AlumnoPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (isNaN(id)) {
    // If the ID is not a valid number, we can't find the student.
    return notFound();
  }
  
  const cicloId = await getCicloActual();
  const alumno = await AlumnoService.getById(id);

  if (!alumno) {
    return notFound();
  }

  return <AlumnoDetalle alumno={alumno} cicloId={cicloId} />;
}