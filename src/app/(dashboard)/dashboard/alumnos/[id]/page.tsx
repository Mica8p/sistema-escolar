import { AlumnoService } from "@/service/alumno.service";
import AlumnoDetalle from "@/components/modules/alumnos/AlumnoDetalle";
import { notFound } from "next/navigation";

export default async function AlumnoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Buscamos al alumno con toda su información relacionada
  const alumno = await AlumnoService.getById(Number(id));

  if (!alumno) {
    return notFound();
  }

  return <AlumnoDetalle alumno={alumno} />;
}